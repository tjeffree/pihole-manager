import time
import requests
import re
import os
from dotenv import load_dotenv

load_dotenv()

PI_ONE = os.getenv("PI_ONE")
PI_TWO = os.getenv("PI_TWO")
PI_ONE_AUTH = os.getenv("PI_ONE_AUTH")
PI_TWO_AUTH = os.getenv("PI_ONE_AUTH")

hosts = [
  f'http://{PI_ONE}/admin/api.php?auth={PI_ONE_AUTH}&',
  f'http://{PI_TWO}/admin/api.php?auth={PI_TWO_AUTH}&'
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

      try:

        req1  = requests.get(x + "summaryRaw&topItems", headers={"Accept":"application/json"})
        txt1  = req1.text
        json1 = req1.json()

        with open(f'{datadir}/summary-{i}.json', 'w') as fh:
            fh.write(txt1 + "\n")
        
        fh.close()
        
      except:
        pass
      
      i += 1

    time.sleep(2)

main_program()
