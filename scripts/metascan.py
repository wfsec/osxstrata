import json, urllib, urllib2, argparse, hashlib, re, sys, os
from pprint import pprint
from pymongo import ASCENDING, DESCENDING,MongoClient
from datetime import datetime
from urllib2 import Request, urlopen
def db_connect():
    """
    connect to the database

    :return:database connection object
    """
    client = MongoClient(os.environ['MONGO_CONNECT'])
    db = client['meteor']
 
    return db

DB = db_connect()

APIkey = DB.settings.find({'type':'Metascan_api_key'})[0]['value']
BASEURL = 'https://hashlookup.metascan-online.com/v2/'


def getReport(md5):
  url = BASEURL + "hash/"+ md5
  r = Request(url)
  r.add_header('apikey', APIkey)
  result = json.loads(urlopen(r).read())
  return result

def countThreats(detes):
  foundCount = 0
  if detes:
    for key,val in detes.iteritems():
      for k, value in val.iteritems():
        if k == 'threat_found':
          if value:
            foundCount += 1
  else:
    print 'Scan Details was empty:('
    foundCount = -1
  return foundCount

def parseReport(mtResults,md5):
  file_info = ''
  scan_details = ''
  score = -1
  for key, val in mtResults.iteritems():
    if val == 'Not Found':
      DB.project.update({"md5":md5},{"$set":{"mt_results":-1,'mt_data':mtResults}},multi=True)
      DB.hashes.update({"md5":md5},{"$set":{"mt_results":-1,"mt_data":mtResults}})
      print 'HASH Not Found'
      return
  for key, val in mtResults.iteritems():
    if key == 'scan_results':
      for keyd, value in val.iteritems():
        if keyd == 'scan_details':
          scan_details = value
          score = countThreats(value)
    elif key == 'file_info':
      file_info = val

    DB.project.update({"md5":md5},{"$set":{"mt_results":score,'mt_data':{'scan_details':scan_details, 'file_info':file_info}}},multi=True)
    DB.hashes.update({"md5":md5},{"$set":{"mt_results":score,'mt_data':{'scan_details':scan_details, 'file_info':file_info}}})





