# blinkmobile / server-cli

# Server Side API Code Deployment

This tool is for deploying server side code for your APIs hosted on the OneBlink API Hosting service.

<br/>

## Setting Scope

Before you deploy, you will need to set the scope for your project. The scope will specify where your project will be deployed to.

This is the URL you are given when creating the API endpoint within the OneBlink Console. Don't include the _https://_

For example:
```
bm server scope myorg-myendpoint.api.oneblink.io
```

<br/>

## Scope Information

```
bm server scope
```

Running the _scope_ command without specifying a URL will return the current scope.

<br/>

## Server Info

To view information about your project, you can use the info command:
```
bm server info
```

This will return information about your current project, including the current scope, CORS configuration, and the Routes based on your current folder structure.

This is a good way to double check your current project status, especially when returning to an existing project at a later date.

<br/>

## Serve Locally

During development, you can run your code locally on your machine by using the "serve" command.
```
bm server serve
```

This will create a local server and so you'll be able to access your scripts as you would if they were on the server.

Any calls made to this local server will be listed in your command line window.


### Options:
#### --port
The port option will allow you to set a custom port. By default, port 3000 is used.

<br/>

## Deploying files

### Authentication
Before you're able to deploy to your api hosting instance, you will need to be authenticated. This is done by logging in with the OneBlink Identity CLI.

```
bm identity login
```

If you haven't installed or used the Identity CLI before, please see: [Identity CLI Usage](https://github.com/blinkmobile/identity-cli#usage)

<br/>

### Basic Deployment
To deploy your code or assets, run the _deploy_ command:
```
bm server deploy
```

This will automatically create all of the serverless infrastructure and configuration needed, and then upload the files in your current directory to the "dev" environment for your API Hosting instance.

You can change the default behaviour by using additional options:

<br/>

### Additional Options

#### --env
This option allows you to specify an environment. If the environment doens't yet exist, it will be created when you first deploy to it.

```
bm client deploy --env test
```
The above code will deploy to your "test" environment, and will be specified as part of the subdomain for your deployment.

For example: `https://myorg-myendpoint-test.api.oneblink.io`

When you're ready to deploy to production, use the environment _prod_
```
bm client deploy --env prod
```
This will deploy to your production environment and give you a URL that does not contain an environment tag.

For example: `https://myorg-myendpoint.api.oneblink.io`


#### --force
This will deploy your project without asking for confirmation. This feature is designed to allow automatic deployments for those interested in an automated release.
```
bm client deploy --force
```
 
 


