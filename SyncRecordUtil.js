var SyncRecordUtil = Class.create();
SyncRecordUtil.prototype = Object.extendsObject(GlideRecordUtil, {
	
	getFieldsToIgnoreMap: function(fieldToIgnoreList) {
		return fieldToIgnoreList.split(',').reduce(function(fieldMap, fieldName) {
			fieldMap[fieldName] = true;
			return fieldMap;
		}, {});
	},
	
	syncRecordListToTable: function(recordList, tableName, ignoreFieldsList, keepMostRecentRecord, setWorkflow, autoSysFields) {
		var grTable = new GlideRecord(tableName);
		var tableLabel = grTable.getLabel();
		// convert list of fields to ignore to an object
		var fieldsToIgnore = this.getFieldsToIgnoreMap(ignoreFieldsList);
		
		var resultList = recordList.map(function(record) {
			if (grTable.get(record.sys_id)) {
				// record already exists
				var currentUpdatedOn = grTable.sys_updated_on.getGlideObject().getNumericValue();
				var loadedUpdatedOn  = GlideDateTime(record.sys_updated_on).getNumericValue();
				if ( !keepMostRecentRecord || (loadedUpdatedOn > currentUpdatedOn) ) {
					// load remote record
					grTable.initialize();
					this.mergeToGR(record, grTable, fieldsToIgnore);
				}
				else {
					// ignore remote record
					gs.log(tableLabel + ' record "' + grTable.getDisplayValue() + '" (' + record.sys_id + ') not loaded', 'SyncRecordUtil');
				}
			}
			else {
				// record does not exist yet
				//grTable.newRecord();
				grTable.setNewGuidValue(record.sys_id);
				this.mergeToGR(record, grTable, fieldsToIgnore);
				gs.log('Inserting new "' + tableLabel + '" record "' + grTable.getDisplayValue() + '" (' + record.sys_id + ')', 'SyncRecordUtil');
			}
			grTable.setWorkflow((setWorkflow !== false));
			grTable.autoSysFields((autoSysFields !== false));
			return grTable.update();
		}, this);
		
		return resultList;
	},
	
	type: 'SyncRecordUtil'
});