# osxstrata
OS X Strata builds upon Yelps OSXCollector, providing a user interface to analyze data collected from a potentially compromised system.

Currently there are two ways that you can run OSXStrata. 

1. Run from the git directory. - Quick and easy.
2. Run as an application.

We are working on a thrid option a docker container. We hope to have that done in the next couple of weeks. 

Pre Installation Checklist
1. Xcode is needed if you plan to use git to clone the project code. <-OS X only obviously.

2. pip (package manger) needs to be installed.
~~~shell
sudo easy_install pip
~~~
3. Install required python modules
~~~shell
sudo pip install pymongo (2.8 required)
~~~
~~~shell
sudo pip install requests 
~~~
~~~shell
sudo pip install simplejson
~~~
~~~shell
Install Meteor
	-> curl https://install.meteor.com/ | sh
~~~

### 1. Running from the git directory.

OS X & Linux
~~~shell	
git clone <insert git repo>
~~~
~~~shell
export PATH_TO_SCRIPTS=<path> MONGO_CONNECT=mongodb://localhost:3001/
~~~
~~~shell
meteor run
~~~

### 2. Run as an application.

OS X
BUILD APP Option 1:
Ensure pre-installation checklist is done.
~~~shell
meteor build osxstrata
cd osxstrata
mv osxstrata.tar.gz ~/dirctoryofchoice
tar -xvf osxstrata.tar.gz
~~~
The uncompressed file should create a directory called bundle. 

Build APP Option 2:
Instead of creating the tar file you can download it from the git repo.

~~~shell
tar -xvf osxstrata.tar.gz
~~~
The uncompressed file should create a directory called bundle.
	
Installing NODE and MONGO

Node:
Download and install:
https://nodejs.org/dist/v0.10.40/node-v0.10.40.pkg

Mongo:
Follow these Instructions:
https://docs.mongodb.org/v3.0/tutorial/install-mongodb-on-os-x/

Add /mongodb/bin to full path
~~~shell
sudo vim /etc/paths
	/Users/<user>/mongodb/bin
~~~
Start mongodb
~~~shell
mongod --port 3001
~~~
Change to the bundle directory you created earlier. 
~~~shell
cd <bundle>/programs/server
npm install
~~~
Start the app
~~~shell
cd bundle
env PORT=3000 PATH_TO_SCRIPTS=<path> MONGO_CONNECT=mongodb://localhost:3001/ ROOT_URL=http://localhost MONGO_URL=mongodb://localhost:3001/meteor node main.js
~~~

Linux
Build APP Option 1:
Ensure pre-installation checklist is done.
~~~shell
meteor build osxstrata
cd osxstrata
mv osxstrata.tar.gz ~/directoryofchoice
tar -xvf osxstrata.tar.gz
~~~
The uncompressed file should create a directory called bundle. 

BUILD APP Option 2:
Instead of creating the tar file you can download it from the git repo.

~~~shell
tar -xvf osxstrata.tar.gz
~~~
The uncompressed file should create a directory called bundle.
	
Installing NODE and MONGO

Node:
~~~shell
wget http://nodejs.org/dist/v0.10.40/node-v0.10.40-linux-x64.tar.gz
tar -xvf node-v0.10.40-linux-x64.tar.gz
cd node-v0.10.40-linux-x64/lib/node_modules/npm/
./configure
make install
~~~

Follow instructions here:
https://docs.mongodb.org/v3.0/tutorial/install-mongodb-on-red-hat/

Start Mongo:
edit mongo conf change port to 3001
~~~shell
sudo vim /etc/mongod.conf
service mongod start
~~~

TO START APP:
~~~shell
	cd bundle
	env PORT=3000 PATH_TO_SCRIPTS=<path> MONGO_CONNECT=mongodb://localhost:3001/ ROOT_URL=http://localhost MONGO_URL=mongodb://localhost:3001/meteor node main.js

Other:
***

PATH_TO_SCRIPTS will be where ever you put the scripts folder. 

****
Link to Sign up for IBM X-Force Threat Exchange
https://www.ibm.com/account/profile/us?page=reg

Sign up for Public VirusTotal API 
https://www.virustotal.com/
