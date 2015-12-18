import urllib2
import subprocess,shlex
import commands
import simplejson as json
import re
import pymongo
from pymongo import ASCENDING, DESCENDING,MongoClient
import base64

### Grabs an apikey and password and b64 encodes them

def xfe_get_token(db):
	return base64.b64encode(db.settings.find({'type':'IBM_X-Force_api_key'})[0]['value'] + ':' + db.settings.find({'type':'IBM_X-Force_api_password'})[0]['value'])


### Returns live and passive DNS records from IBM Xforce

def xfe_dns_check(xfe_token,domain):

	url = "https://api.xforce.ibmcloud.com/resolve/%s " % domain
	cmd = """curl -s %s -H 'Accept-Language: en-US,' -H 'Authorization: Bearer %s' -H 'Accept: application/json'""" % (url,xfe_token)
	p = subprocess.Popen(shlex.split(cmd.encode('ascii')), stdout=subprocess.PIPE).communicate()[0]
	dns_results=json.loads(p)
	return dns_results


### Returns the IP report for the entered IP from IBM Xforce

def xfe_ip_rep_check(xfe_token,ip):

	url = "https://api.xforce.ibmcloud.com/ipr/malware/%s " % ip
	cmd = """curl -s %s -H 'Accept-Language: en-US,' -H 'Authorization: Bearer %s' -H 'Accept: application/json'""" % (url,xfe_token)
	p = subprocess.Popen(shlex.split(cmd.encode('ascii')), stdout=subprocess.PIPE).communicate()[0]
	ip_rep_results=json.loads(p)
	return ip_rep_results


### Returns the URL report for the entered URL from IBM Xforce

def xfe_url_check(xfe_token,url):
	url = "https://api.xforce.ibmcloud.com/url/%s" % re.sub(ur"\u2019",'',url)
	htoken = "Basic "+ xfe_token
	headers = {'Authorization': htoken,}
	request = urllib2.Request(url, None, headers)
	
	try:
		data = urllib2.urlopen(request,timeout=30)
	except urllib2.HTTPError, e:
		if e.code != 404:
			print "\033[31mERROR::=> %s \n %s \033[0m" % (e,url)
		return {'error':'not found'}
	except urllib2.URLError, e:
		print "\033[31mERROR::=> %s \n %s \033[0m" % (e,url)
		return {'error':'not found'}
	except IOError, e:
		print "\033[31mERROR::=> %s \n %s \033[0m" % (e,url)
		return {'error':'not found'} 

	url_results = json.loads(data.read())
	return url_results

### Returns the Internet Application Profiles (IAP) that needs to be fetched from IBM Xforce

def xfe_app_check(xfe_token,app):

	url = "https://api.xforce.ibmcloud.com/app/%s" % app
	cmd = """curl -s %s -H 'Accept-Language: en-US,' -H 'Authorization: Bearer %s' -H 'Accept: application/json'""" % (url,xfe_token)
	p = subprocess.Popen(shlex.split(cmd.encode('ascii')), stdout=subprocess.PIPE).communicate()[0]
	app_results=json.loads(p)
	return app_results


### Returns a malware report for the given md5 from IBM Xforce

def xfe_malware_check(xfe_token,md5):
	url = "https://api.xforce.ibmcloud.com/malware/%s" % md5
	htoken = "Basic "+ xfe_token
	headers = {'Authorization': htoken,}
	request = urllib2.Request(url, None, headers) 

	try:
		data = urllib2.urlopen(request)
	except urllib2.HTTPError, e:
		if e.code != 404:
			print "\033[31mERROR::=> %s \n %s \033[0m" % (e,md5)
		return {'error':'not found'}
	except urllib2.URLError, e:
		print "\033[31mERROR::=> %s \n %s \033[0m" % (e,md5)
		return {'error':'not found'}
	except IOError, e:
		print "\033[31mERROR::=> %s \n %s \033[0m" % (e,md5)
		return {'error':'not found'} 

	md5_results = json.loads(data.read())
	return md5_results

