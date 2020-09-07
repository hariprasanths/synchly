## Configuration using file

For initializing a module configuration using a file, you'll need a JSON file of the following structure:

### Database Configuration

**/home/foo/dbConfig.json:**
```
{
    "databaseType": <database type (MySQL | MongoDB)>,
    "username": <database username>,
    "password": <database password>,
    "host": <database hostname>,
    "port": <database server port>,
    "databaseName": <database name>,
    "backupPath": <absolute path of the directory for storing local backups>,
    "enableCompression": <boolean to enable backup compression (true | false)>,
    "backupTime": <time to run the backups every day (Format - hh:mm)>,
    "noOfDailies": <No. of days to persist backups for>,
    "noOfWeeklies": <No. of weeks to persist backups for>,
    "noOfMonthlies": <No. of months to persist backups for>
}
```

```
$ synchly --config=db --file=/home/foo/dbConfig.json
```

### Cloud Storage (remote-sync) configuration

**/home/foo/remoteConfig.json**
```
{
    "remoteType": <remote service (Google Drive | SFTP)>,
    "serviceAccountKeyPath": <absolute path of service account key file (mandatory for remoteType: Google Drive)>,
    "host": <sftp hostname or ip of remote server (mandatory for remoteType: SFTP)>,
    "port": <sftp port (mandatory for remoteType: SFTP)>,
    "username": <sftp username (mandatory for remoteType: SFTP)>,
    "password": <sftp password (mandatory for remoteType: SFTP)>,
    "backupPath": <absolute path of the directory for storing backups in remote server (mandatory for remoteType: SFTP)>
}
```

```
$ synchly --config=remote-sync --file=/home/foo/remoteConfig.json
```

### Status notifications (smtp) configuration

**/home/foo/smtpConfig.json:**
```
{
    "host": <smtp hostname>,
    "port": <smtp port>,
    "username": <smtp username>,
    "password": <smtp password>,
    "senderMail": <smtp sender e-mail>,
    "recipientMail": <smtp recipient e-mail>,
    "notificationTime": <time to send the status updates every day (Format - hh:mm)>
}
```

```
$ synchly --config=smtp --file=/home/foo/smtpConfig.json
```