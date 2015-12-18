import json, urllib, urllib2, argparse, hashlib, re, sys, os
from pprint import pprint
from pymongo import ASCENDING, DESCENDING,MongoClient
from datetime import datetime

def db_connect():
    """
    connect to the database

    :return:database connection object
    """
    client = MongoClient(os.environ['MONGO_CONNECT'])
    db = client['meteor']
 
    return db

APIkey = db_connect().settings.find({'type':'Virus_Total_api_key'})[0]['value']
BASEURL = 'http://www.virustotal.com/vtapi/v2/'


def getReport(md5):
  param = {'resource':md5,'apikey':APIkey,'allinfo': '1'}
  url = BASEURL + "file/report"
  data = urllib.urlencode(param)
  result = urllib2.urlopen(url,data)
  jdata =  json.loads(result.read())
  return jdata

def getDomainReport(domain):
  param = {'domain':domain,'apikey':APIkey}
  url = BASEURL + "domain/report"
  data = urllib.urlencode(param)
  result = urllib2.urlopen(url,data)
  jdata =  json.loads(result.read())
  return jdata
   
# Md5 Function

def checkMD5(checkval):
  if re.match(r"([a-fA-F\d]{32})", checkval) == None:
    md5 = md5sum(checkval)
    return md5.upper()
  else: 
    return checkval.upper()

def md5sum(filename):
  fh = open(filename, 'rb')
  m = hashlib.md5()
  while True:
      data = fh.read(8192)
      if not data:
          break
      m.update(data)
  return m.hexdigest() 
          
def parse(it, md5, verbose, jsondump):
  if it['response_code'] == 0:
    print md5 + " -- Not Found in VT"
    return 0
  print "\n\tResults for MD5: ",it['md5'],"\n\n\tDetected by: ",it['positives'],'/',it['total'],'\n\tSophos Detection:',it['scans']['Sophos']['result'] ,'\n\tKaspersky Detection:',it['scans']['Kaspersky']['result'], '\n\tTrendMicro Detection:',it['scans']['TrendMicro']['result'],'\n\tScanned on:',it['scan_date'],'\n\tFirst Seen:',it['first_seen'],'\n\tLast Seen:',it['last_seen'],'\n\tUnique Sources',it['unique_sources'],'\n\tSubmission Names:'
  for x in it['submission_names']:
    print "\t\t",x
  if jsondump == True:
    jsondumpfile = open("VTDL" + md5 + ".json", "w")
    pprint(it, jsondumpfile)
    jsondumpfile.close()
    print "\n\tJSON Written to File -- " + "VTDL" + md5 + ".json"

  if verbose == True:
    print '\n\tVerbose VirusTotal Information Output:\n'
    for x in it['scans']:
     print '\t', x,'\t' if len(x) < 7 else '','\t' if len(x) < 14 else '','\t',it['scans'][x]['detected'], '\t',it['scans'][x]['result']



