# Synchronizer
Tools to synchronize data records between ServiceNow instances, by pulling records from a remote instance and merging (insert or update) them with local records.

## Connection & Credentials > Connections & Credentials Aliases

1. Create a new Alias and make sure it has a linked Connection with active = true
2. Provide a valid credential to the source (remote) instance

## PullData API
1. syncTableRecords
..* tableName: name of the table to query from
..* encodedQuery: ServiceNow encoded query to select the records to read from the source
..* ignoreFieldsList: list of fields, spearated by comma's, to ignore (`user_password,title`)
..* keepMostRecentRecord: true/false, this option will not override the local (target) record if it was updated more recently than the remote (source) record
..* setWorkflow: true/false, run Business Rules or not
..* autoSysFields: true/false, copies system fields (sys_updated_on, sys_updated_by, sys_created_on, sys_created_by, sys_mod_count) from source when set to false

## Background script example
```javascript
var pdTest = new PullData('PersonalDevInstance');
gs.print(JSON.stringify(pdTest.syncTableRecords('sys_user', 'user_name=test_user', 'user_password,title', true, false, true)));
```