import urllib2
import subprocess,shlex
import json


def getShadow(md5):
	url = "http://bin-test.shadowserver.org/api?md5=%s" % md5
	try:
		request = urllib2.Request(url)
		sock=urllib2.urlopen(request,timeout=20)
		s = sock.read()
		sock.close()
	except:
		print "Erorr with shadowserver: %s " % url
		return [0,url]
	# print s
	# print len(s)
	if len(s)>34:
		return [-1,url]
	else:
		return [1,url]

