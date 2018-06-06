var PullData = Class.create();
PullData.prototype = {
	initialize: function(connectionAlias) {
		var grConnection = new GlideRecord('http_connection');
		grConnection.addActiveQuery();
		grConnection.addQuery('connection_alias.id', connectionAlias);
		grConnection.query();
		
		if (grConnection.next()) {
			this._connection = grConnection;
		}
		else {
			throw(gs.getMessage('Unable find an active connection for alias "' + connectionAlias));
		}
	},
	
	getEndpoint: function(tableName) {
		var endpoint = this._connection.connection_url + '/api/now/table/' + tableName;
		
		return endpoint;
	},
	
	getCredential: function() {
		var credential = { "user": undefined, "password": undefined };
		var grConnection = this._connection;
		if (grConnection.getValue('credential')) {
			credential.user = grConnection.credential.user_name.toString();
			credential.password = new GlideEncrypter().decrypt(grConnection.credential.password.toString());
		}
		else {
			throw(gs.getMessage('No credential defined for connection "' + grConnection.connection_alias.id + '"'));
		}
		return credential;
	},
	
	syncTableRecords: function(tableName, encodedQuery, ignoreFieldsList, keepMostRecentRecord, setWorkflow, autoSysFields) {
		try {
			var credential = this.getCredential();
			var request = new sn_ws.RESTMessageV2();
			request.setEndpoint(this.getEndpoint(tableName));
			request.setHttpMethod('get');
			request.setRequestHeader('Accept', 'application/json');
			request.setHttpTimeout(10000);
			request.setBasicAuth(credential.user, credential.password);
			request.setQueryParameter('sysparm_exclude_reference_link', true); // exclude links to reference fields!
			if (encodedQuery != '' && encodedQuery !== undefined) {
				request.setQueryParameter('sysparm_query', encodedQuery);
			}
			var response = request.execute();
			var httpStatus = response.getStatusCode();
			//gs.debug('http status = ' + httpStatus, 'PullData');
			var recordList = JSON.parse(response.getBody()).result;
			//gs.debug('Body = ' + response.getBody(), 'PullData');
			
			return new SyncRecordUtil().syncRecordListToTable(recordList, tableName, ignoreFieldsList, keepMostRecentRecord, setWorkflow, autoSysFields);
		}
		catch(ex) {
			gs.log('Error: ' + ex.getMessage(), 'PullData');
		}
	},
	
	type: 'PullData'
};