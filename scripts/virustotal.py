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

