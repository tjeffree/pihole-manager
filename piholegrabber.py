import time
import requests
import re
import os
from dotenv import load_dotenv

load_dotenv()

PI_ONE = os.getenv("PI_ONE")
PI_TWO = os.getenv("PI_TWO")

hosts = [
  f'http://{PI_ONE}/admin/api.php?',
  f'http://{PI_TWO}/admin/api.php?'
]

print(f'Monitoring: {hosts}')

pdir = os.path.dirname(os.path.abspath(__file__))
datadir = f'{pdir}/data'

if not os.path.isdir(datadir):
  try:
    os.mkdir(datadir)
  except OSError:
    print ("Creation of the directory %s failed" % path)

def main_program():

  while True:

    i = 1

    for x in hosts:

      adsblocked   = 0
      queriestoday = 0

      try:

        req1  = requests.get(x + "summary", headers={"Accept":"application/json"})
        txt1  = req1.text
        json1 = req1.json()

        ablock = float(re.sub("[^0-9]", "", json1['ads_blocked_today']))
        qtoday = float(re.sub("[^0-9]", "", json1['dns_queries_today']))

        if ablock > 0:
          adsblocked   = adsblocked + ablock
        if qtoday > 0:
          queriestoday = queriestoday + qtoday

        with open(f'{datadir}/summary-{i}.json', 'w') as fh:
            fh.write(txt1 + "\n")
        
        fh.close()
        
      except:
        pass

      try:
        ratioblocked = round((adsblocked / queriestoday) * 100, 1)
      except:
        pass
      
      i += 1

    time.sleep(2)

main_program()
