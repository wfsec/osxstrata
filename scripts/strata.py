import os,commands,sys
import copy
import hashlib
import pymongo
from pymongo import ASCENDING, DESCENDING,MongoClient
from datetime import datetime
from bson.objectid import ObjectId
import time
import re
import requests, urllib2
import simplejson as json
import xforceMod,shadowServer
import virustotal as vt
import metascan as mt
import threading
from bson.objectid import ObjectId


def db_connect():
    """
    connect to the database

    :return:database connection object
    """
    client = MongoClient(os.environ['MONGO_CONNECT'])
    db = client['meteor']
 
    return db

DB = db_connect()
CHECKED = {}
CHECKEDHASH = {}
IBMCHECKED = {}
TOKEN = xforceMod.xfe_get_token(db_connect())
IBMXFORCEURL_MIN = DB.settings.find({'label':'IBM X-Force URL'})[0]['min']
IBMXFORCEURL_MAX = DB.settings.find({'label':'IBM X-Force URL'})[0]['max']
IBMXFORCEMD5_MIN = DB.settings.find({'label':'IBM X-Force MD5'})[0]['min']
IBMXFORCEMD5_MAX = DB.settings.find({'label':'IBM X-Force MD5'})[0]['max']
VIRUSTOTAL_MIN =   DB.settings.find({'label':'VirusTotal'})[0]['min']
VIRUSTOTAL_MAX =   DB.settings.find({'label':'VirusTotal'})[0]['max']
SHADOW_MIN =       DB.settings.find({'label':'Shadow'})[0]['min']
SHADOW_MAX =       DB.settings.find({'label':'Shadow'})[0]['max']
BLACKLIST_MIN =    DB.settings.find({'label':'Blacklist'})[0]['min']
BLACKLIST_MAX =    DB.settings.find({'label':'Blacklist'})[0]['max']
PATH = 			   os.environ['PATH_TO_SCRIPTS']

def importBlackList():
	##creating a dict of all domains to compare against, faster than making individual db queries
	global DOMAINS 
	domainstmp = DB.domains.find({},{'data':1})
	DOMAINS = {}
	for i in domainstmp:
		DOMAINS[i['data']] = 1
	
	url = [["http://www.dshield.org/feeds/suspiciousdomains_High.txt",'DShieldHigh'],["http://www.dshield.org/feeds/suspiciousdomains_Medium.txt",'DShieldMed'],["http://www.dshield.org/feeds/suspiciousdomains_High.txt","DShieldLow"],["http://www.joewein.de/sw/blacklist/dom-bl.txt",'JoeWeinSpam'],["http://www.malwaredomainlist.com/hostslist/hosts.txt",'MalwareDomainList'],["http://hosts-file.net/download/hosts.txt","MalwareBytes"],["https://lists.malwarepatrol.net/cgi/getfile?receipt=f1439488739&product=8&list=smoothwall","MalwarePatrol-SmoothWall"],["https://lists.malwarepatrol.net/cgi/getfile?receipt=f1439488739&product=8&list=mozilla_adblock","MalwarePatrol-MozillaAdblock"]]

	domainJson = ''	
	for i in range(0,len(url)):
		print ' ====> ' +  url[i][0] + '\n'
		run = True
		try:
			request = urllib2.Request(url[i][0])
			sock=urllib2.urlopen(request,timeout=20)
			s = sock.read()
			sock.close()
			s = s.strip().split('\n')
		except:
			run = False
		if run:
			print "# of Records: %s " % len(s)
			for k in range(0,len(s)):
				if len(s[k]) > 2:
					if s[k][0].isalnum():
						if url[i][1] == 'DShieldHigh':
							if not checkDomainList(s[k].strip('\t').strip('\r')):
								domainJson += '{ "source":"' + url[i][1] + '","data":"' + s[k].strip('\t').strip('\r') + '","lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
						elif url[i][1] == 'DShieldMed':
							if not checkDomainList(s[k].strip('\t').strip('\r')):
								domainJson += '{ "source":"' + url[i][1] + '","data":"' + s[k].strip('\t').strip('\r')  + '","lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
						elif url[i][1] == 'DShieldLow':
							if not checkDomainList(s[k].strip('\t').strip('\r')):
								domainJson += '{ "source":"' + url[i][1] + '","data":"' + s[k].strip('\t').strip('\r')  + '","lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
						elif url[i][1] == 'JoeWeinSpam':
							if not checkDomainList(s[k].strip('\t').strip('\r')):
								domainJson += '{ "source":"' + url[i][1] + '","data":"' + s[k].strip('\t').strip('\r')  + '","lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
						elif url[i][1] == 'MalwareDomainList':
							fields = s[k].split(' ')
							if not checkDomainList(fields[1].strip('\t').strip('\r')):
								domainJson += '{ "source":"' + url[i][1] + '","data":"' + fields[1].strip('\t').strip('\r') + '","lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
						elif url[i][1] == 'MalwareBytes':
							fields = s[k].split('\t')
							if not checkDomainList(fields[1].strip('\t').strip('\r')):
								domainJson += '{ "source":"' + url[i][1] + '","data":"' + fields[1].strip('\t').strip('\r') + '","lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
						elif url[i][1] == 'MalwarePatrol-SmoothWall':
							if not checkDomainList(s[k].strip('\t').strip('\r') ):
								domainJson += '{ "source":"' + url[i][1] + '","data":"' + s[k].strip('\t').strip('\r')  + '","lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
						elif url[i][1] == 'MalwarePatrol-MozillaAdblock':
							if not checkDomainList(s[k].strip('\t').strip('\r')):
								domainJson += '{ "source":"' + url[i][1] + '","data":"' + s[k].strip('\t').strip('\r')  + '","lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
					if k % 1000 == 0:
						per = (float(k)/len(s)) * 100
						print '%s%% done' % per
	domain = open(PATH + 'domains.json','w')
	domain.write(domainJson)
	domain.close()
	importOneJson(PATH + 'domains.json','domains')
	
	### not quite ready for this yet 
	# url = [["http://rules.emergingthreats.net/blockrules/compromised-ips.txt",'EmergingThreats'], ["https://palevotracker.abuse.ch/blocklists.php?download=ipblocklist",'Palevotracker'], ["http://malc0de.com/bl/IP_Blacklist.txt",'Malc0de'], ["https://zeustracker.abuse.ch/blocklist.php?download=ipblocklist",'ZuesTracker'],["http://www.binarydefense.com/banlist.txt",'BinaryDefense'],["https://reputation.alienvault.com/reputation.snort",'AlienVault'], ["https://sslbl.abuse.ch/blacklist/sslipblacklist.csv", 'SSLBL']] 
	# IPJson = ''	
	# for i in range(0,len(url)):
	# 	print ' ====> ' +  url[i][0] + '\n'
	# 	run = True
	# 	try:
	# 		request = urllib2.Request(url[i][0])
	# 		sock=urllib2.urlopen(request,timeout=20)
	# 		s = sock.read()
	# 		sock.close()
	# 		s = s.strip().split('\n')
	# 	except:
	# 		run = False
	# 	if run:
	# 		for k in range(0,len(s)):
	# 			if len(s[k]) > 0:
	# 				if '#' in s[k][0] or '/' in s[k][0]: 
	# 					pass
	# 						# IPJson += '{ "source":"' + url[i][1] + '","ip":"' + s[k].strip('\t').strip('\r') + '","reason":"None", "lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
	# 				else:
	# 					if url[i][1] == 'EmergingThreats':
	# 						IPJson += '{ "source":"' + url[i][1] + '","ip":"' + s[k].strip('\t').strip('\r') + '","reason":"None", "lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
	# 					elif url[i][1] == 'Palevotracker':
	# 						IPJson += '{ "source":"' + url[i][1] + '","ip":"' + s[k].strip('\t').strip('\r') + '","reason":"None", "lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
	# 					elif url[i][1] == 'Malc0de':
	# 						IPJson += '{ "source":"' + url[i][1] + '","ip":"' + s[k].strip('\t').strip('\r') + '","reason":"None", "lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
	# 					elif url[i][1] == 'ZuesTracker':
	# 						IPJson += '{ "source":"' + url[i][1] + '","ip":"' + s[k].strip('\t').strip('\r') + '","reason":"None", "lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
	# 					elif url[i][1] == 'BinaryDefense':
	# 						IPJson += '{ "source":"' + url[i][1] + '","ip":"' + s[k].strip('\t').strip('\r') + '","reason":"None", "lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
	# 					elif url[i][1] == 'AlienVault':
	# 						ip = s[k].split(' # ')
	# 						IPJson += '{ "source":"' + url[i][1] + '","ip":"' + ip[0] + '","reason": "' + ip[1] + '", "lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
	# 					elif url[i][1] == 'SSLBL':
	# 						ip = s[k].split(',')
	# 						IPJson += '{ "source":"' + url[i][1] + '","ip":"' + ip[0]+ '","reason":"None", "lastDate":"'+ datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d') + '"}\n'
	# ip = open('ip.json','w')
	# ip.write(IPJson)
	# ip.close()
	# importOneJson('ip.json','ips')
	# cmd = '/bin/rm -f ip.json'
	# (status,output) = commands.getstatusoutput(cmd)

def checkDomainList(domain):
	if domain in DOMAINS:
		return True
	# print '\033[35m NEW %s \n \033[0m' % domain
	return False

def importOneJson(json,section):
	if PATH:
		cmd = 'mongoimport --host 127.0.0.1:3001  --db meteor --collection %s --type json  --file %s' %(section,json)
		(status,output) = commands.getstatusoutput(cmd)
		print cmd
		print status
		print output
	else:
		print '\033[32m[!] PATH TO SCRIPTS NOT SET'
def importProject(pathToFile):
	cmd = 'mongoimport --host 127.0.0.1:3001  --db meteor --collection project --type json  --file %s' %(pathToFile)
	(status,output) = commands.getstatusoutput(cmd)
	f = open(pathToFile,'r')
	for line in f:
		if '"osxcollector_section": "system_info"' in line:
				data = json.loads(line)
	DB.project.insert({'projectID':data["osxcollector_incident_id"],"osxcollector_incident_id":data["osxcollector_incident_id"]})
	
	return data["osxcollector_incident_id"]	
###
### 
# Does the analysis
##
##
def analyze(id):
	print 'ANALYSIS'

#chrome
	#chrome1 = DB.chrome.find({"originating_url":{"$exists": 'true'},"url":{"$regex":"http"},"osxcollector_incident_id":id},timeout=False)

	chrome2 = DB.project.find({"osxcollector_section":"chrome","url":{"$exists": 'true'},"url":{"$regex":"http"},"osxcollector_incident_id":id},timeout=False)

	chrome3 = DB.project.find({"osxcollector_section":"chrome","referrer":{"$exists": 'true'},"referrer":{"$regex":"http"},"osxcollector_incident_id":id},timeout=False)

	chrome4 = DB.project.find({"osxcollector_section":"chrome","signon_realm":{"$exists": 'true'},"signon_realm":{"$regex":"http"},"osxcollector_incident_id":id},timeout=False)

	chrome5 = DB.project.find({"osxcollector_section":"chrome","origin":{"$exists": 'true'},"origin":{"$regex":"http"},"osxcollector_incident_id":id},timeout=False)

	chrome6 = DB.project.find({"osxcollector_section":"chrome","host_key":{"$exists": 'true'},"osxcollector_incident_id":id},timeout=False)

#firefox
	firefox1 = DB.project.find({"osxcollector_section":"firefox","originating_url":{"$exists": 'true'},"url":{"$regex":"http"},"osxcollector_incident_id":id},timeout=False)

	firefox2 = DB.project.find({"osxcollector_section":"firefox","url":{"$exists": 'true'},"url":{"$regex":"http"},"osxcollector_incident_id":id},timeout=False)

	firefox3 = DB.project.find({"osxcollector_section":"firefox","referrer":{"$exists": 'true'},"referrer":{"$regex":"http"},"osxcollector_incident_id":id},timeout=False)

	firefox4 = DB.project.find({"osxcollector_section":"firefox","baseDomain":{"$exists": 'true'},"osxcollector_incident_id":id},timeout=False)

	firefox5 = DB.project.find({"osxcollector_section":"firefox","host":{"$exists": 'true'},"osxcollector_incident_id":id},timeout=False)

	firefox6 = DB.project.find({"osxcollector_section":"firefox","scope":{"$exists": 'true'},"osxcollector_incident_id":id},timeout=False)

#safari
	safari1 = DB.project.find({"osxcollector_section":"safari","DownloadEntryURL":{"$exists": 'true'},"DownloadEntryURL":{"$regex":"http"},"osxcollector_incident_id":id},timeout=False)

	safari2 = DB.project.find({"osxcollector_section":"safari","osxcollector_subsection": "history","osxcollector_incident_id":id},timeout=False)

	safari3 = DB.project.find({"osxcollector_section":"safari","origin":{"$exists": 'true'},"origin":{"$regex":"http"},"osxcollector_incident_id":id},timeout=False)

	downloads1 = DB.project.find({"osxcollector_section":"downloads","xattr-wherefrom":{"$exists": 'true'},"osxcollector_incident_id":id},timeout=False)

	quarantines1 = DB.project.find({"osxcollector_section":"quarantines","LSQuarantineDataURLString":{"$exists": 'true'},"LSQuarantineDataURLString":{"$regex":"http"},"osxcollector_incident_id":id},timeout=False)

	md51 = DB.project.find({"osxcollector_section":"downloads","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)


	md52 = DB.project.find({"osxcollector_section":"quarantines","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)

	md53 = DB.project.find({"osxcollector_section":"kext","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)

	md54 = DB.project.find({"osxcollector_section":"applications","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)

	md51a = DB.project.find({"osxcollector_section":"downloads","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)


	md52a = DB.project.find({"osxcollector_section":"quarantines","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)

	md53a = DB.project.find({"osxcollector_section":"kext","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)

	md54a = DB.project.find({"osxcollector_section":"applications","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)
	
	md55a = DB.project.find({"osxcollector_section":"startup","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)

	md55b = DB.project.find({"osxcollector_section":"startup","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)

	mailMD5 = DB.project.find({"osxcollector_section":"mail","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)

	mailMD5a = DB.project.find({"osxcollector_section":"mail","md5":{"$exists": 'true'},"osxcollector_incident_id":id},{'md5':'1'},timeout=False)

	try:
		#t1  = threading.Thread( target=blackListCheck,   args=(chrome1,'chrome','originating_url',id))
		t2  = threading.Thread( target=blackListCheck,   args=(chrome2,'chrome','url',id))
		t3  = threading.Thread( target=blackListCheck,   args=(chrome3,'chrome','referrer',id))
		t4  = threading.Thread( target=blackListCheck,   args=(firefox1,'firefox','originating_url',id))
		t5  = threading.Thread( target=blackListCheck,   args=(firefox2,'firefox','url',id))
		t6  = threading.Thread( target=blackListCheck,   args=(firefox3,'firefox','referrer',id))
		t7  = threading.Thread( target=blackListCheck,   args=(firefox4,'firefox','baseDomain',id))
		t8  = threading.Thread( target=blackListCheck,   args=(firefox5,'firefox','host',id))
		t9  = threading.Thread( target=blackListCheck,   args=(firefox6,'firefox','scope',id))
		t10 = threading.Thread( target=blackListCheck,   args=(safari1,'safari','DownloadEntryURL',id))
		t11 = threading.Thread( target=blackListCheck,   args=(safari2,'safari','',id))
		t12 = threading.Thread( target=blackListCheck,   args=(safari3,'safari','origin',id))
		t13 = threading.Thread( target=blackListCheck,   args=(downloads1,'downloads','xattr-wherefrom',id))
		t14 = threading.Thread( target=blackListCheck,   args=(quarantines1,'quarantines','LSQuarantineDataURLString',id))
		t15 = threading.Thread( target=hashCheck,  args=('downloads',md51,id))
		t16 = threading.Thread( target=hashCheck,  args=('quarantines',md52,id))
		t17 = threading.Thread( target=hashCheck,  args=('kext',md53,id))
		t18 = threading.Thread( target=hashCheck,  args=('applications',md54,id))
		t19 = threading.Thread( target=shadow, args=('downloads', md51a,id))
		t20 = threading.Thread( target=shadow, args=('quarantines', md52a, id))
		t21 = threading.Thread( target=shadow, args=('kext', md53a, id))
		t22 = threading.Thread( target=shadow, args=('applications', md54a, id))
		t23 = threading.Thread( target=hashCheck, args=('startup', md55a, id))
		t24 = threading.Thread( target=shadow, args=('startup', md55b, id))
		t25 = threading.Thread( target=shadow, args=('mail', mailMD5, id))
		t26 = threading.Thread( target=hashCheck, args=('mail',mailMD5a, id))
		t27  = threading.Thread( target=blackListCheck,   args=(chrome4,'chrome','signon_realm',id))
		t28  = threading.Thread( target=blackListCheck,   args=(chrome5,'chrome','origin',id))
		t29  = threading.Thread( target=blackListCheck,   args=(chrome6,'chrome','host_key',id))


		#t1.start()
		t2.start()
		t3.start()
		t4.start()
		t5.start()
		t6.start()
		t7.start()
		t8.start()
		t9.start()
		t10.start()
		t11.start()
		t12.start()
		t13.start()
		t14.start()
		t15.start()
		t16.start()
		t17.start()
		t18.start()
		t19.start()
		t20.start()
		t21.start()
		t22.start()
		t23.start()
		t24.start()
		t25.start()
		t26.start()
		t27.start()
		t28.start()
		t29.start()

		t2.join()
		t3.join()
		t4.join()
		t5.join()
		t6.join()
		t7.join()
		t8.join()
		t9.join()
		t10.join()
		t11.join()
		t12.join()
		t13.join()
		t14.join()
		t15.join()
		t16.join()
		t17.join()
		t18.join()
		t19.join()
		t20.join()
		t21.join()
		t22.join()
		t23.join()
		t24.join()
		t25.join()
		t26.join()
		t27.join()
		t28.join()
		t29.join()
	except:
		print "Error: unable to start thread"





def shadow(collection,coll,id):
	"""Checks Shadow Server white list with md5 hash
	Input ==> mongodb cursor (coll) and the collection name (collection)
	Output ==> None
	Updates hash in collections Downloads,quarantines,kext, applications and hashes
	"""
	c = coll.count()
	p = 0
	for i in coll:
		if p % 1000 == 0:
			print "\033[36m%s of %s shadow, %s \033[0m" % (str(p), str(c) , collection)
		q = {'md5':i['md5']}
		hashes = DB.hashes.find_one(q)
		if hashes:
			if "shadow_results" not in hashes.keys():
				rslts = shadowServer.getShadow(i['md5'])
				DB.project.update({"_id": i["_id"]},{"$set":{"shadow_results": rslts[0],"shadow_url": rslts[1], 'shadow_data': rslts[2]}})
				DB.hashes.update(q,{"$set":{"shadow_results":rslts[0], 'shadow_data':rslts[2]}})
			else:
				url = "http://bin-test.shadowserver.org/api?md5=%s" % i['md5']
				DB.project.update({"_id": i["_id"]},{"$set":{"shadow_results": hashes["shadow_results"],"shadow_url": url, "shadow_data": hashes['shadow_data']}})
		else:
			rslts = shadowServer.getShadow(i['md5'])
			DB.project.update({"_id": i["_id"]},{"$set":{"shadow_results": rslts[0],"shadow_url": rslts[1], "shadow_data": rslts[2]}})
			DB.hashes.update({'md5':i['md5']}, {'$set':{'md5':i['md5'],"shadow_results":rslts[0], "shadow_data": rslts[2]}},upsert=True)
		p+=1
	
	print "\033[36mShadow ==> Collection: %s done\033[0m" % (collection)		

def hashCheck(collection,coll,id):
	token = TOKEN
	c = coll.count()	
	p = 0
	new = 0
	old = 0
	for i in coll:
		if p % 1000 == 0:
			print "\033[32m%s of %s %s \033[0m" % (str(p), str(c) ,collection)
		try:
			if i['md5'] not in CHECKEDHASH.keys():
				q = {'md5':i['md5']}
				malware = DB.hashes.find_one(q)
				if malware:
					if "ibm_rating" in malware.keys():
						old += 1
						DB.project.update({"_id":i['_id']},{"$set":{"ibm_md5_results":malware['ibm_rating'], "ibm_malware_family":malware['ibm_family'], "ibm_risk" : malware['ibm_risk']}})
						CHECKEDHASH[i['md5']] = [malware['ibm_rating'],malware['ibm_family'], malware['ibm_risk']]
					else:
						old += 1
						rslts = xforceMod.xfe_malware_check(token,i['md5'])
						if 'error' not in rslts.keys():
							rating = rslts['malware']['origins']['external']['detectionCoverage']
							family = rslts['malware']['origins']['external']['family']
							if rating == 0:
								rating = -1
							DB.hashes.update({'md5':i['md5']},{"$set":{'ibm_rating':rating, "ibm_family": family, "ibm_risk": rslts['malware']['risk']}})
							DB.project.update({"_id":i['_id']},{"$set":{"ibm_md5_results":rating, "ibm_malware_family":family, "ibm_risk": rslts['malware']['risk']}})
							CHECKEDHASH[i['md5']] = [rating, family, rslts['malware']['risk']]
						else:
							#print str(p),rslts
							DB.project.update({"_id":i['_id']},{"$set":{"ibm_md5_results":-1, "ibm_family":'None', "ibm_risk": 'None'}})
							DB.hashes.update({'md5':i['md5']},{"$set":{'ibm_rating': -1, "ibm_family":'None', "ibm_risk": 'None'}})
							CHECKEDHASH[i['md5']] = [-1, 'None', 'None']

				else:
					rslts = xforceMod.xfe_malware_check(token,i['md5'])
					#print "NOT IN HASHES %s" % i['md5'] 
					new += 1
					if 'error' not in rslts.keys():
						rating = rslts['malware']['origins']['external']['detectionCoverage']
						family = rslts['malware']['origins']['external']['family']
						if rating == 0:
							rating = -1
						DB.hashes.update({'md5':i['md5']},{'$set':{'md5':i['md5'],'ibm_rating':rating, "ibm_family": family, "ibm_risk": rslts['malware']['risk']}},upsert=True)
						DB.project.update({"_id":i['_id']},{"$set":{"ibm_md5_results":rating, "ibm_malware_family":family, "ibm_risk": rslts['malware']['risk']}})
						CHECKEDHASH[i['md5']] = [rating, family, rslts['malware']['risk']]
					else:
						#print "Returned ERROR"
						DB.project.update({"_id":i['_id']},{"$set":{"ibm_md5_results":-1, "ibm_family":'None', "ibm_risk": 'None'}})
						DB.hashes.update({'md5':i['md5']},{'$set':{'md5':i['md5'],'ibm_rating': -1, "ibm_family":'None', "ibm_risk": 'None'}},upsert=True)
						CHECKEDHASH[i['md5']] = [-1, 'None', 'None']

			else:
				old += 1
				DB.project.update({"_id":i['_id']},{"$set":{"ibm_md5_results":CHECKEDHASH[i['md5']][0], "ibm_malware_family":CHECKEDHASH[i['md5']][1], "ibm_risk": CHECKEDHASH[i['md5']][2]}})

		except RuntimeError, e:
			print "\033[31m SOME ERROR::=> %s \n %s \033[0m" % (e,i)
	
		p += 1
	


	print "\033[32mMalware ==> Collection: %s, New: %s, Old: %s\033[0m" % (collection,new,old)		

	coll.close()

def blackListCheck(coll,collection,doc,id):
	token = TOKEN
	c = coll.count()	
	p = 0
	# new = 0
	# old = 0
	for i in coll:
		if p % 1000 == 0:
			print "\033[35m%s of %s %s , %s \033[0m" % (str(p), str(c) ,doc ,collection) 
		try:
			##only checking the first xattr-wherefrom url in this analysis, doing it manually in the ui will 
			if doc == "xattr-wherefrom":
				url = i[doc][0].replace('www.','')
			elif doc == "host_key":
				if i[doc].index('.') == 0:
					url = i[doc][1:len(i[doc])]
				else:
					url = i[doc]
			else:
				url = i[doc].replace('www.','')
			if '/' in url:
				spliturl = url.split('/')
				if len(spliturl) <3:
					return 
				domain = spliturl[2]
			elif '_' in url:
				spliturl = url.split('_')
				if len(spliturl) <3:
					return line
				domain = spliturl[1]
			else:
				domain = url
			# checked to see if the domain has been processed in this run already, no dB lookup
			##BlackList Check
			if domain not in CHECKED.keys():
				rslts = DB.domains.find_one({"data":domain,"source":{"$ne":"IBMXFORCE"}})
				if rslts:
					DB.project.update({"_id":i['_id']},{"$set":{"black_list":2,"Black_List_Source":rslts['source'],"BlackList_Domain":rslts['data']}})
					CHECKED[domain] = [2,rslts['source'],rslts['data']]
				else:
					rslts = DB.domains.find_one({"data": {"$regex": domain},"source":{"$ne":"IBMXFORCE"}})
					if rslts:
						DB.project.update({"_id":i['_id']},{"$set":{"black_list":1,"Black_List_Source":rslts['source'],"BlackList_Domain":rslts['data']}})
						CHECKED[domain] = [1,rslts['source'],rslts['data']]
					else:
						DB.project.update({"_id":i['_id']},{"$set":{"black_list":-1,"Black_List_Source":None,"BlackList_Domain":None}})
						CHECKED[domain] = [-1,None,None]
			else:
				DB.project.update({"_id":i['_id']},{"$set":{"black_list":CHECKED[domain][0],"Black_List_Source":CHECKED[domain][1],"BlackList_Domain":CHECKED[domain][2]}})
			

			if domain not in IBMCHECKED.keys():
				q = {"data":domain,'source':'IBMXFORCE'}
				domainLookup = DB.domains.find_one(q)
				if domainLookup:
					DB.project.update({"_id":i['_id']},{"$set": {"ibm_domain_results":domainLookup['ibm_domain_results'], 'ibm_domain_data':domainLookup['ibm_domain_data']}})
					IBMCHECKED[domain] = [domainLookup['ibm_domain_results'],domainLookup['ibm_domain_data']]
				else:
					ibm = xforceMod.xfe_url_check(token,domain.strip())
					if 'error' not in ibm.keys():
							score = float(ibm['result']['score'])
							DB.project.update({"_id":i['_id']},{"$set": {"ibm_domain_results":score, 'ibm_domain_data':ibm}})
							IBMCHECKED[domain] = [score,ibm]
							DB.domains.insert({"data":domain,"source":"IBMXFORCE","ibm_domain_results":score,'ibm_domain_data':ibm,"lastDate":datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d')})
					else:
						IBMCHECKED[domain] = [-1,'Url Not Found']
						DB.project.update({"_id":i['_id']},{"$set": {"ibm_domain_results":-1, 'ibm_domain_data':'None'}})
						DB.domains.insert({"data":domain,"source":"IBMXFORCE","ibm_domain_results":-1,'ibm_domain_data':'None',"lastDate":datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d')})

			else:
				DB.project.update({"_id":i['_id']},{'$set':{"ibm_domain_results":IBMCHECKED[domain][0], 'ibm_domain_data':IBMCHECKED[domain][1]}})



		except RuntimeError, e:
			print "\033[31m SOME ERROR::=> %s \n %s \033[0m" % (e,i)

		p+=1
	coll.close()

		

	print "\033[35mBlack List Check Finished ==> %s > %s\033[0m" %(collection,doc)

def virustotal(id):
	allmd5s = DB.project.find({'md5':{'$exists':True},"osxcollector_incident_id":id, 'flagged':True },{"md5":1})
	md5s = []
	for t in allmd5s:
		if t not in md5s:
			md5s.append(t)
	print '\033[32m[+]%s HASHES to check with Virustotal\033[0m' % len(md5s)
	c = 0
	# md5CSV = ''
	if len(md5s) > 0:
		for i in md5s:
			print i['md5']
			if i['md5'] != None:
				####check to see if hash has already been run against virustotal
				q = {"md5":i['md5'],"vt_results":{"$exists":True},"vt_scan_date":{"$exists":True}, "vt_data":{"$exists":True}}
				checkFirst = DB.hashes.find_one(q)
				if checkFirst:
					print 'hash found in DB'
					DB.project.update({"md5":checkFirst['md5']},{"$set":{"vt_results":checkFirst['vt_results'],"vt_scan_date":checkFirst['vt_scan_date'], "vt_data":checkFirst['vt_data']}},multi=True)
				else:
					scan = vt.getReport(i['md5'])
					if isinstance(scan,dict):
						if scan['response_code'] != 0:
							score = scan['positives']
							if score == 0:
								score = -1
							DB.project.update({"md5":scan['resource']},{"$set":{"vt_results":score,"vt_scan_date":scan['scan_date'], "vt_data": scan}},multi=True)
							DB.hashes.update({"md5":scan['resource']},{"$set":{"vt_results":score,"vt_scan_date":scan['scan_date'], "vt_data": scan}},upsert=True)				
						else:
							DB.project.update({"md5":scan['resource']},{"$set":{"vt_results":-1, 'vt_scan_date':datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d'), "vt_data": 'None'}},multi=True)
							DB.hashes.update({"md5":scan['resource']},{"$set":{"vt_results":-1 ,'vt_scan_date':datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d'), "vt_data": 'None'}},upsert=True)

					else:
						for indv in range(0,len(scan)):
							if scan[indv]['response_code'] != 0:
								score = scan[indv]['positives']
								if score == 0:
									score = -1
								DB.project.update({"md5":scan[indv]['resource']},{"$set":{"vt_results":score,"vt_scan_date":scan[indv]['scan_date'], "vt_data": scan[indv]}},multi=True)
								DB.hashes.update({"md5":scan[indv]['resource']},{"$set":{"vt_results":score,"vt_scan_date":scan[indv]['scan_date'], "vt_data": scan[indv]}},upsert=True)
							else:
								DB.project.update({"md5":scan[indv]['resource']},{"$set":{"vt_results":-1, 'vt_scan_date':datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d'), "vt_data": scan[indv]}},multi=True)
								DB.hashes.update({"md5":scan[indv]['resource']},{"$set":{"vt_results":-1, 'vt_scan_date':datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d'), "vt_data": scan[indv]}},upsert=True)

					time.sleep(15)
	else:
		print "NONE"
			
def remove():
	DB.project.remove({})
	

def removeWithID(id):
	DB.project.remove({"osxcollector_incident_id":id})

def virusTotalMd5CheckUI(hash):
	scan = vt.getReport(hash)
	if scan['response_code'] != 0:
		score = scan['positives']
		if score == 0:
			score = -1
		DB.project.update({"md5":scan['resource']},{"$set":{"vt_results":score,"vt_scan_date":scan['scan_date'], "vt_data": scan}},multi=True)
		DB.hashes.update({"md5":scan['resource']},{"$set":{"vt_results":score,"vt_scan_date":scan['scan_date'], "vt_data": scan}},upsert=True)
		if score >0:
			DB.project.update({"md5":scan['resource']},{"$set":{"flagged":True}},multi=True)

	else:
		DB.project.update({"md5":scan['resource']},{"$set":{"vt_results":-1, 'vt_scan_date':datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d'), "vt_data": scan}},multi=True)
		DB.hashes.update({"md5":scan['resource']},{"$set":{"vt_results":-1,'vt_scan_date':datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d'), "vt_data": scan}},upsert=True)

def metascanMd5Check(md5):
	mt.parseReport(mt.getReport(md5),md5)

def metascan(id):
	##find all md5s that were flagged by initial analysis
	allmd5s = DB.project.find({'md5':{'$exists':True},"osxcollector_incident_id":id, 'flagged':True },{"md5":1})
	md5s = []
	###all md5s in a list
	for t in allmd5s:
		if t not in md5s:
			md5s.append(t)

	##iterate over md5s and run against metascan
	for x in md5s:
		print '\033[32m %s \033[0m' % x['md5']
		##check to see if it has already been sent to metascan, if not send to metascan
		q = {"md5":x['md5'],"mt_results":{"$exists":True},"mt_data":{"$exists":True}}
		checkFirst = DB.hashes.find_one(q)
		if checkFirst:
			DB.project.update({"md5":checkFirst['md5']},{"$set":{"mt_results":checkFirst['mt_results'],"mt_data":checkFirst['mt_data']}},multi=True)
		else:
			mt.parseReport(mt.getReport(x['md5']),x['md5'])
			time.sleep(2.4)

def virusTotalDomainCheckUI(url):
	# I am gonig to come back to this at some point.
	curl = url.split('/')
	print vt.getDomainReport(curl[2])

def ibmXforceMd5CheckUI(hash):
	q = {'md5':hash}
	malware = DB.hashes.find_one(q)
	#if the hash is already in our collection of hashes and has an ibm_rating already
	if malware:
		if "ibm_rating" in malware.keys():
			DB.project.update({"md5":hash},{"$set":{"ibm_md5_results":malware['ibm_rating'], "ibm_malware_family":malware['ibm_family'], "ibm_risk": malware['ibm_risk']}},multi=True)
			return
		## if the hash doesn't have an ibm_rating or isn't in our hash collection, we make an api call to xforce
	rslts = xforceMod.xfe_malware_check(TOKEN,hash)
	if 'error' not in rslts.keys():
		rating = rslts['malware']['origins']['external']['detectionCoverage']
		family = rslts['malware']['origins']['external']['family']
		if rating ==0:
			rating == -1
		DB.hashes.update({'md5':hash},{"$set":{'ibm_rating':rating, "ibm_family": family, "ibm_risk": rslts['malware']['risk']}},upsert=True)
		DB.project.update({"md5":hash},{"$set":{"ibm_md5_results":rating, "ibm_malware_family":family, "ibm_risk": rslts['malware']['risk']}},multi=True)
	else:
		DB.project.update({"md5":hash},{"$set":{"ibm_md5_results":-1, "ibm_malware_family":'None', "ibm_risk": 'None'}},multi=True)
		DB.hashes.update({'md5':hash},{"$set":{'ibm_rating': -1, "ibm_family":'None', "ibm_risk": 'None'}},upsert=True)

def ibmXforceDomainCheckUI(url,id):
	p = {"_id":ObjectId(id)}

	domain = url.replace('www.','')
	q = {"data": {"$regex": domain},'source':'IBMXFORCE'}
	domainLookup = DB.domains.find_one(q)
	if domainLookup:
		DB.project.update(p,{"$set": {"ibm_domain_results":domainLookup['ibm_domain_results'], 'ibm_domain_data':domainLookup['ibm_domain_data']}})
	else:
		ibm = xforceMod.xfe_url_check(TOKEN,domain)
		if 'error' not in ibm.keys():
			score = float(ibm['result']['score'])
			DB.project.update(p,{"$set": {"ibm_domain_results":score, 'ibm_domain_data':ibm}})
			DB.domains.insert({"data":domain,"source":"IBMXFORCE","ibm_domain_results":score,'ibm_domain_data':ibm,"lastDate":datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d')})
		else:
			DB.project.update(p,{"$set": {"ibm_domain_results":-1, 'ibm_domain_data':'None'}})
			DB.domains.insert({"data":domain,"source":"IBMXFORCE","ibm_domain_results":-1,'ibm_domain_data':'None',"lastDate":datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d')})

def sendHashIBM(hash):
	""" This is for updating hashes using IBM XFORCE api 
	We aren't implementing it as of now but its here Jan 2016"""
	rslts = xforceMod.xfe_malware_check(TOKEN,hash)
	if 'error' not in rslts.keys():
		rating = rslts['malware']['origins']['external']['detectionCoverage']
		family = rslts['malware']['origins']['external']['family']
		if rating ==0:
			rating == -1
		DB.hashes.update({'md5':hash},{"$set":{'ibm_rating':rating, "ibm_family": family}},upsert=True)
		DB.project.update({"md5":hash},{"$set":{"ibm_md5_results":rating, "ibm_malware_family":family}},multi=True)
	else:
		DB.project.update({"md5":hash},{"$set":{"ibm_md5_results":-1, "ibm_malware_family":'None'}},multi=True)
		DB.hashes.update({'md5':hash},{"$set":{'ibm_rating': -1, "ibm_family":'None'}},upsert=True)



def updateHashes():
	""" This is for updating hashes using IBM XFORCE api 
	We aren't implementing it as of now but its here Jan 2016"""
	cur = DB.hashes.find({},{'md5':1}).limit(10000)
	for i in range(0,cur.count(with_limit_and_skip=True)):
		if i % 15 == 0:
			print i
			x  = threading.Thread( target=sendHashIBM,   args=(cur[i]['md5'],))			
			x1 = threading.Thread( target=sendHashIBM,   args=(cur[i+1]['md5'],))
			x2 = threading.Thread( target=sendHashIBM,   args=(cur[i+2]['md5'],))
			x3 = threading.Thread( target=sendHashIBM,   args=(cur[i+3]['md5'],))
			x4 = threading.Thread( target=sendHashIBM,   args=(cur[i+4]['md5'],))
			x5 = threading.Thread( target=sendHashIBM,   args=(cur[i+5]['md5'],))
			x6 = threading.Thread( target=sendHashIBM,   args=(cur[i+6]['md5'],))
			x7 = threading.Thread( target=sendHashIBM,   args=(cur[i+7]['md5'],))
			x8 = threading.Thread( target=sendHashIBM,   args=(cur[i+8]['md5'],))
			x9 = threading.Thread( target=sendHashIBM,   args=(cur[i+9]['md5'],))
			x10 = threading.Thread( target=sendHashIBM,   args=(cur[i+10]['md5'],))
			x11 = threading.Thread( target=sendHashIBM,   args=(cur[i+11]['md5'],))
			x12 = threading.Thread( target=sendHashIBM,   args=(cur[i+12]['md5'],))
			x13 = threading.Thread( target=sendHashIBM,   args=(cur[i+13]['md5'],))
			x14 = threading.Thread( target=sendHashIBM,   args=(cur[i+14]['md5'],))
			
			x.start()
			x1.start()
			x2.start()
			x3.start()
			x4.start()
			x5.start()
			x6.start()
			x7.start()
			x8.start()
			x9.start()
			x10.start()
			x11.start()
			x12.start()
			x13.start()
			x14.start()

			x.join()
			x1.join()
			x2.join()
			x3.join()
			x4.join()
			x5.join()
			x6.join()
			x7.join()
			x8.join()
			x9.join()
			x10.join()
			x11.join()
			x12.join()
			x13.join()
			x14.join()


	return 'Finshed Updates to Hashes Colection'

def flag(cursor):
	for i in cursor:
		DB.project.update({"_id":i["_id"]},{"$set":{"flagged":True}})


def flagging(id):
	###FLAG BLAKLIST
	if DB.settings.find({'label':'Blacklist'})[0]['on']:
		print '\033[32m[+]\033[0m BLACKLIST FLAGGING ON'	
		flag(DB.project.find({"osxcollector_incident_id":id,"black_list":{"$gte": BLACKLIST_MIN, "$lt":BLACKLIST_MAX}},{"_id":1}))
	else:
		print '\033[33m[!]\033[0m BLACKLIST FLAGGING ON'	
	###FLAG IBM XFORCE URLS
	if DB.settings.find({'label':'IBM X-Force URL'})[0]['on']:
		print '\033[32m[+]\033[0m IBM X-Force URL FLAGGING ON'	
		flag(DB.project.find({"osxcollector_incident_id":id,'ibm_domain_results':{'$elemMatch':{'score':{'$gte':IBMXFORCEURL_MIN, '$lte': IBMXFORCEURL_MAX}}}},{"_id":1}))	 
	else:
		print '\033[33m[!]\033[0m IBM X-Force URL FLAGGING ON'
	###FLAG IBM XFORCE MD5S
	if DB.settings.find({'label':'IBM X-Force MD5'})[0]['on']:
		print '\033[32m[+]\033[0m IBM X-FORCE MD5 FLAGGING ON'	
		flag(DB.project.find({"osxcollector_incident_id":id,"ibm_md5_results":{"$gte":IBMXFORCEMD5_MIN, "$lte":IBMXFORCEMD5_MAX}},{"_id":1}))	 
	else:
		print '\033[33m[!]\033[0m IBM X-FORCE MD5 FLAGGING OFF'
	####FLAG SHADOW SERVER
	if DB.settings.find({'label':'Shadow'})[0]['on']:
		print '\033[32m[+]\033[0m SHADOW SERVER FLAGGING ON'		
		flag(DB.project.find({"osxcollector_incident_id":id,"shadow_results":{'$gte': SHADOW_MIN, '$lte': SHADOW_MAX}},{"_id":1}))
	else:
		print '\033[33m[!]\033[0m SHADOW SERVER FLAGGING OFF'
	###FLAG VIRUSTOTAL
	if DB.settings.find({'label':'VirusTotal'})[0]['on']:
		print '\033[32m[+]\033[0m VIRUSTOTAL FLAGGING ON'		
		flag(DB.project.find({"osxcollector_incident_id":id,"vt_results":{'$gte': VIRUSTOTAL_MIN, '$lte': VIRUSTOTAL_MAX}},{"_id":1}))
	else:
		print '\033[33m[!]\033[0m VIRUSTOTAL FLAGGING OFF'

def getThemCounts():
	DB.bigcounts.update({'label':'Total Count'},{'$set':{'count':DB.project.find({}).count()}})
	DB.bigcounts.update({'label':'Hash Count'},{'$set':{'count':DB.hashes.find({}).count()}})
	DB.bigcounts.update({'label':'Flagged Count'},{'$set':{'count':DB.project.find({'flagged':True}).count()}})
	DB.bigcounts.update({'label':'Blacklist Count'},{'$set':{'count':DB.domains.find({}).count()}})


def help():
	print "-a  \t Import Json File and Run Analysis\n \t\t -a <Path to File> \n"
	print "-n  \t Import Json File \n \t \t -n <Path to File>\n"
	print "-r  \t Remove all imported data from Project Collection"
	print "-ri \t Remove a specific incident from Project Collection \n  \t\t -ri <osxcollector_incident_id>\n"
	print "--virusTotal  \t Send either hash or domain/url to VirusTotal API \n  \t\t --virusTotal --hash <md5> \n \t\t --virusTotal <domain/url>\n"
	print "--ibmXforce  \t Send either hash or domain/url to IBM Xforce API \n  \t\t --ibmXforce --hash <md5> \n \t\t --ibmXforce <domain/url>\n"
	print "-h This Help Menu"
	
def main():
	if sys.argv[1] == '-h':
		help()
	elif sys.argv[1] == '-b':
		importBlackList()
		getThemCounts()
	elif sys.argv[1] == '-n':
		importProject(sys.argv[2])
		DB.project.update({'xattr-wherefrom' :{'$exists':1}},{'$rename':{'xattr-wherefrom':'xattrwherefrom'}},multi=True)
		getThemCounts()
	elif sys.argv[1] == '-r':
		remove()
		getThemCounts()
	elif sys.argv[1] == '-ri':
		removeWithID(sys.argv[2])
		getThemCounts()
	elif sys.argv[1] == '--virusTotal':
		if sys.argv[2] == '--hash':
			virusTotalMd5CheckUI(sys.argv[3])
		else:
			virusTotalDomainCheckUI(sys.argv[3])
		getThemCounts()
	elif sys.argv[1] == '--metascan':
		if sys.argv[2] == '--hash':
			metascanMd5Check(sys.argv[3])
		getThemCounts()
	elif sys.argv[1] == '--ibmXforce':
		if sys.argv[2] == '--hash':
			ibmXforceMd5CheckUI(sys.argv[3])
		else:
			ibmXforceDomainCheckUI(sys.argv[3],sys.argv[4])
		getThemCounts()
	elif sys.argv[1] == '--update':
		print 'Updating'
		updateHashes()
		getThemCounts()
	elif sys.argv[1] == '-a':
		id = importProject(sys.argv[2])
		# id = importJsonNoAnalysis(sys.argv[1])
		print "FINISHED IMPORT STARTING ANALYSIS... %s" % id
		analyze(id)
		flagging(id)
		print "\033[32m[+] Starting Metascan Analysis....\033[0m"
		metascan(id)
		print "\033[32m[+] Starting VirusTotal Analysis....\033[0m"
		virustotal(id)
		print '\033[34m[*] FINISHED IMPORT and ANALYSIS\033[0m'
		DB.project.update({'xattr-wherefrom' :{'$exists':1}},{'$rename':{'xattr-wherefrom':'xattrwherefrom'}},multi=True)
		getThemCounts()
	elif sys.argv[1] == '-u':
		getThemCounts()
	else:
		help()

if __name__== "__main__":
	main()
