## Database configuration

#### MongoDB

```
$ synchly --config db
? Choose the type of database to backup MongoDB
? Enter your database username: foo
? Enter your database password: ***
? Enter the database hostname: localhost
? Enter the database server port: 27017
? Enter the database name to backup: foobar
? Enter the absolute path of the directory for storing local backups: /home/foobar/backups/
? Do you want the backup files to be encrypted? Yes
? Do you want to enable backup compression? Yes
? Enter the time to run the backups every day: 2:30 GMT+0530
? Enter the No. of days to persist backups for (1 backup per day): 7
? Enter the No. of weeks to persist backups for (1 backup per week): 8
? Enter the No. of months to persist backups for (1 backup per month): 6
✔ Authentication success
Database configuration updated successfully.
```

#### MySQL

```
$ synchly --config db
? Choose the type of database to backup MySQL
? Enter your database username: foo
? Enter your database password: ***
? Enter the database hostname: localhost
? Enter the database server port: 3306
? Enter the database name to backup: foobar
? Enter the absolute path of the directory for storing local backups: /home/foobar/backups/
? Do you want the backup files to be encrypted? Yes
? Do you want to enable backup compression? Yes
? Enter the time to run the backups every day: 2:30 GMT+0530
? Enter the No. of days to persist backups for (1 backup per day): 7
? Enter the No. of weeks to persist backups for (1 backup per week): 8
? Enter the No. of months to persist backups for (1 backup per month): 6
✔ Authentication success
Database configuration updated successfully.
```

## Cloud Storage (remote-sync) configuration

#### Google Drive

Synchly uses a service account for authentication to use Google Drive API.<br/> 
Steps to create a service account: </br>
* Visit [Google Cloud Console](https://console.developers.google.com) and select a project or create a new one. You can access credentials  page using the tab on the left. Go to the [Credentials](https://console.developers.google.com/apis/credentials) page, click “create credentials” and then click “service account key”.
* When you’re done, you’ll get a JSON file with the following structure:
```
{
  "type": "service_account",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "",
  "token_uri": "",
  "auth_provider_x509_cert_url": "",
  "client_x509_cert_url": ""
}
```
* The absolute path of the downloaded service account key file is used in the remote-sync configuration.
* Enable API - You should enable the APIs you want to use in [Google’s API Library](https://console.developers.google.com/apis/library). By default, nothing is enabled, to prevent you from changing anything by accident. You’ll need to enable [Google Drive](https://console.developers.google.com/apis/api/drive.googleapis.com).
* Share Files - To use the service account method of authentication, you’ll need to provide access to the service account. Find the "client_email" key in your service account key file downloaded and copy the value. This is the email address that you’ll need to share, and it will look something like:
```
service-account@projectname-123456.iam.gserviceaccount.com
```
Create a new folder in your account’s Google Drive, and then share it with the "client-email" in your service account key file. Sharing access to the service account is required, and it’s one of the reasons a service account is more secure than a simple API key.

```
$ synchly --config remote-sync
? Choose the remote service: Google Drive
? Enter the absolute path of the service account key file: /home/foobar/googleCreds.json
✔ Authentication success
? Choose the remote folder in which backups will be stored: Backups
Remote Sync configuration updated successfully.
```

#### SFTP

```
$ synchly --config remote-sync 
? Choose the remote service: SFTP
? Enter the hostname or IP of the remote server: exampleHostName.com
? Enter the port number of the remote server: 22
? Enter the username for authentication: foo
? Enter the password for authentication: ***
? Enter the absolute path of the directory for storing backups on the remote server: /home/foobar/backups
✔ Authentication success
Remote Sync configuration updated successfully.
```

## Status notifications (smtp) configuration

You can use any email delivery provider which supports SMTP for configuring status reports.

```
$ synchly --config smtp
? Enter your SMTP hostname: smtp.sendgrid.net
? Enter your SMTP port: 465
? Enter the SMTP username: apikey
? Enter the SMTP password: *******************
? Enter the SMTP sender e-mail: exampleSender@gmail.com
? Enter the SMTP recipient e-mail: exampleRecipient@gmail.com
? Enter the time to send the status updates every day: 06:00 GMT+0530
✔ Authentication success
SMTP configuration updated successfully.
```

#### Using Gmail

Gmail has come up with the concept of [“Less Secure”](https://support.google.com/accounts/answer/6010255?hl=en) apps which is basically anyone who uses a plain password to login to Gmail. You can configure your Gmail account to allow less secure apps [here](https://www.google.com/settings/security/lesssecureapps). When using this method make sure to also enable the required functionality by completing the [“Captcha Enable”](https://accounts.google.com/b/0/displayunlockcaptcha) challenge. Without this, less secure connections probably would not work.

If you are using 2FA you would have to create an [“Application Specific”](https://security.google.com/settings/security/apppasswords) password.

Gmail also always sets an authenticated username as the From: email address. So if you authenticate as foo@example.com and set bar@example.com as the from: address, then Gmail reverts this and replaces the sender with the authenticated user.

```
$ synchly --config smtp
? Enter your SMTP hostname: smtp.gmail.com
? Enter your SMTP port: 465
? Enter the SMTP username: exampleSender@gmail.com
? Enter the SMTP password: ****
? Enter the SMTP sender e-mail: exampleSender@gmail.com
? Enter the SMTP recipient e-mail: exampleRecipient@gmail.com
? Enter the time to send the status updates every day: 06:00 GMT+0530
✔ Authentication success
SMTP configuration updated successfully.
```

## Enabling modules

remote-sync and smtp modules are disabled by default. Even after adding or updating their config via `synchly --config=module`, you have to enable them in order to be able to use the module.

Enable a module like:

```
$ synchly --enable remote-sync
```

```
$ synchly --enable smtp
```

## Disabling modules

Disable a module anytime to stop using it.

```
$ synchly --disable remote-sync
```

```
$ synchly --disable smtp
```

## Stacktrace of errors

Flag `-S, --stacktrace` can be used with the other options to get the full stacktrace of the error.

```
$ synchly --config db --stacktrace
$ synchly --enable remote-sync --stacktrace
$ synchly --start --stacktrace
```

## Running multiple jobs

Create a new job with `-j, --job`. A job named 'master' is created by default if the option `--job` is not specified.

```
$ synchly --job exampleJob --config db
```

All the options can be used along with the option `-j, --job` to make them job-specific.

All jobs are enabled by default. Enable stopped jobs before they can be run.

```
$ synchly --enablejob --job exampleJob
```

Disable a job to stop it from running.

```
$ synchly --disablejob --job exampleJob
```

Reset all the saved configurations for a job using the option `--reset`.

```
$ synchly --job exampleJob --reset
```

Start all the enabled jobs using the option `--start`

```
$ synchly --start
```

Show all the created jobs using the option `--jobs`

```
$ synchly --jobs
```