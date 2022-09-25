from aiohttp import ClientSession
import json
import asyncio
import time
import os
from nltk.tokenize import word_tokenize
from nltk import ngrams, FreqDist

import requests
from bs4 import BeautifulSoup

import string


# API KEY

#ac5af4af4d6d3bc398ebe0de863c80e4
#08a9b62eef83bd08d30edac802c2fa38
#7a0ac81e5f1e75720eacb95e5b6e354f
#476147be4e91ffc918d7771b628fe8a0
KEY = "4ce6ba6400c654c0212d870d4c448f1a"

# 50 states + DC + Federal
STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA",
          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
          "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "NA"]


# get info on a single bill
async def getBill(billID, topic, session, min_year):
    try:
        print("Requesting " + str(billID))
        t = time.time()

        # GET from API
        url = "https://api.legiscan.com/?key={}&op=getBill&id={}".format(
            KEY, billID)

        r = await session.request(method='GET', url=url)
        s = await r.text()
        json_data = json.loads(s)
        
        if 'bill' in json_data.keys():
            if json_data['bill']['session']['year_start'] >= min_year:
                # write to file
                with open("bills/" + topic + "/" + str(billID) + ".json", "w+") as fout:
                    json.dump(json_data, fout)

                print(str(billID) + " completed in " + str(time.time() - t) + "s")
                return json_data
        else:
            print(url + " FAILED")
    except:
        print("failed")


# use async to get a list of bills
async def getBills(billList, topic, session, min_year):
    await asyncio.gather(*[getBill(billID, topic, session, min_year) for billID in billList])
    return True


# GET search raw for a certain topic and state
async def searchRaw(topic, session, state="ALL"):
    
    json_final = {"results": []}
    
    # GET from API
    url = "https://api.legiscan.com/?key={}&op=searchRaw&state={}&query={}&year={}".format(KEY, state, "+".join(i for i in topic.split(" ")), 1)
    
    print(url)

    r = await session.request(method='GET', url=url)
    s = await r.text()
    json_data = json.loads(s)
    
    print(json_data)
    
    json_final['results'].append(json_data['searchresult']['results'])
    
    pages = json_data['searchresult']['summary']['page_total']
    
    if pages > 1:
        for page in range(2, pages + 1):
            url = "https://api.legiscan.com/?key={}&op=searchRaw&state={}&query={}&year={}&page={}".format(KEY, state, "+".join(i for i in topic.split(" ")), 1, page)
    
            print(url)
            
            r = await session.request(method='GET', url=url)
            s = await r.text()
            json_data = json.loads(s)
            
            json_final['results'].append(json_data['searchresult']['results'])
                
    return json_final


# GET all the bills with a certain relevance to a certain topic
async def searchTopic(topic, relevanceCutoff=90, state="ALL"):
    print("Searching topic: " + topic)
    session = ClientSession()

    # GET search raw results
    json_data = await searchRaw(topic, session, state)
    
    billList = []

    for page in json_data['results']:
        for data in page:
            if(data['relevance'] > relevanceCutoff):
                billList.append(data['bill_id'])

    print("Bills found: " + str(len(billList)))

    # create directory
    if not os.path.exists("./bills/" + topic):
        os.mkdir("./bills/" + topic)

    # async GET each bill
    await getBills(billList, topic, session, 2000)

    with open("bills/" + topic + "/result.json", "w+") as fout:
        json.dump(json_data, fout)

    await session.close()

    return billList

# get sessions from a state

def getBillList(topic):
    with open('./bills/' + topic + '/result.json', 'r') as fin:
        data = json.load(fin)
        
    return data["list"]

def updateBillList(topic):
    with open('./bills/' + topic + '/result.json', 'r') as fin:
        data = json.load(fin)
        
    data['list'] = [i.split(".")[0] for i in os.listdir('./bills/' + topic) if i.split(".")[0] != 'result']
    
    with open('./bills/' + topic + '/result.json', 'w') as fout:
        json.dump(data, fout)

async def processBillsTopic(topic):
    billlist = getBillList(topic)
    
    d = dict(zip(range(2000, 2023), [0] * len(range(2000, 2023))))
    
    for billnum in billlist:
        with open('./bills/' + topic + '/' + str(billnum) + '.json', 'r') as fin:
            bill = json.load(fin)
            
        d[bill['bill']['session']['year_start']] += 1
        
    print(d)
    
    print(len(billlist))
    
def categorizeBills(topic):
    billlist = getBillList(topic)
    
    data = {"text": [], "target": []}
    
    for billnum in billlist:
        
        try:
            with open('./bills/' + topic + '/' + str(billnum) + '.json', 'r') as fin:
                bill = json.load(fin)
                
                desc = bill["bill"]["description"]
                
                print("\n\n\n——————————")
                print(desc)
                print("——————\n\n")
                
                target = input("Enter target: ")
                
                data["text"].append(desc)
                data["target"].append(int(target))
        except:
            with open('./bills/abortion_cat.json', 'w+') as fout:
                json.dump(data, fout)
                
            quit()
            
            
            
def clean_bills(topic):
    billlist = getBillList(topic)
    billnums = []
    
    for billnum in billlist:
        with open('./bills/' + topic + '/' + str(billnum) + '.json', 'r') as fin:
            bill = json.load(fin)
            
            if len(bill["bill"]["votes"]) != 0:
                billnums.append(billnum)
                    
    for i in billlist:
        if i not in billnums:
            os.remove('./bills/' + topic + '/' + str(i) + '.json')
            
    with open('./bills/' + topic + '/result.json', 'r') as fin:
        data = json.load(fin)
        
    data['list'] = billnums
    
    with open('./bills/' + topic + '/result.json', 'w') as fout:
        json.dump(data, fout)
   
import math         
            
async def scrape_people(topic):
    billlist = getBillList(topic)
    
    session = ClientSession()
    
    n = math.ceil(len(billlist) / 50)
    
    for i in range(n):
        # for j in range(50 * i, min(len(billlist), 50 * (i + 1))):
        
        # print(50 * i, min(len(billlist), 50 * (i + 1)))
        # print(billlist[50*i:min(len(billlist), 50 * (i + 1))])
        
        print("Starting batch " + str(i + 1))
            
        await asyncio.gather(*[rollCall(topic, billnum, session) for billnum in billlist[50*i:min(len(billlist), 50 * (i + 1))]])
        
        time.sleep(10)
    
    await session.close()
    
dd = {"Voted Yea": "yea", "Voted Nay": "nay", "Absent": "absent", "Abstained": "no vote"}
         
async def rollCall(topic, billnum, session):
    
    try:
        data = {"sponsors": [], "yea": [], "nay": [], "no vote": [], "absent": []}
            
        with open('./bills/' + topic + '/' + str(billnum) + '.json', 'r') as fin:
            print("Processing bill " + str(billnum))
            bill = json.load(fin)
            
            for sponsor in bill["bill"]["sponsors"]:
                data["sponsors"].append(sponsor["ballotpedia"])
                
            for vote in bill["bill"]["votes"]:
                url = vote["url"]
                # print(url)
                r = await session.request(method='GET', url=url)
                s = await r.text()
                
                bs = BeautifulSoup(s, 'html.parser')
        
                print(url, bs.find_all("table", {"id": "gaits-votelist"}))
                table = bs.find_all("table", {"id": "gaits-votelist"})[1].find("tbody")
                
                for i in table.find_all("tr"):
                    # print(i.findChildren("a")
                    hrefs = [j['href'] for j in i.findChildren("a") if "ballotpedia.org" in j['href']]
                    
                    if len(hrefs) > 0:
                        name = hrefs[0].split("/")[-1]
                        data[dd[i.find("span", {"class": "insights"})["title"]]].append(name)
                        
        with open('./bills/_a' + topic + '.json', 'w+') as fout:
            json.dump(data, fout)
    except:
        print("Bill " + str(billnum) + " failed")


# get info on a single bill
async def loadBill(billURL, loc, session):
    try:
        billId = billURL.split("/")[-2]
        data = {"votes": {"No": [], "Yes": [], "Did Not Vote": [], "NA": []}}
        
        # try:        
        print("Requesting " + billURL)
        t = time.time()
        
        # GET from API

        r = await session.request(method='GET', url=billURL)
        s = await r.text()
        
        soup = BeautifulSoup(s, 'html.parser')
        
        body = soup.find("div", {"id": billId}).findChildren("div", recursive=False)[1].findChild()
        
        link = body.findChild()['href']
        
        synps = body.findChildren("div", recursive=False)[3].findChild("p").text
        
        data["synopsis"] = synps
        data["link"] = billURL
        data["name"] = soup.find("h3", {"class": "title"}).text
        
        ll = len(body.findChildren("div", {"class": "col"}))
        
        if ll == 3:
            pg = synps
        elif ll == 4:
            pg = " ".join(" ".join(body.findChildren("div", {"class": "col"})[-2].strings).split())        
        else:
            pg = " ".join(" ".join(body.findChildren("div", {"class": "col"})[-3].strings).split())        
        
        data["pg"] = pg
        
        
        votesLink = "https://justfacts.votesmart.org" + link
        
        r2 = await session.request(method='GET', url=votesLink)
        s2 = await r2.text()
        soup2 = BeautifulSoup(s2, 'html.parser')
        
        table = soup2.findChild("table", {"class": "interest-group-ratings-table"}).findChild("tbody")

        for child in table.findChildren("tr", {"class": "d-flex"}):
            tds = child.findChildren("td")
            politician = tds[2].findChild()['href'].split("/")[-2]
            name = tds[2].findChild().text
            state = tds[0].text
            district = tds[1].text
            party = tds[3].text
            vote = tds[4].text
            
            data["votes"][vote].append((name, politician, party, state, district))
            
            
        with open("bills/" + loc + "/" + billId + ".json", "w+") as fout:
            json.dump(data, fout, ensure_ascii=False)
    except:
        print(billId + " Failed")
            
        
        
    # except:
    #     print(billId + " Failed")


# use async to get a list of bills
async def loadBills(loc, topic):
    try:
    
        num = ls[topic]
        
        billList = []
        
        url = "https://justfacts.votesmart.org/bills/" + loc + "/1/" + str(num)
        
        r = requests.get(url)
        soup = BeautifulSoup(r.content, 'html.parser')
        
        
        table = soup.findChild("table", {"class": "interest-group-ratings-table"}).findChild("tbody")
        
        for child in table.findChildren("tr", {"class": "d-flex"}):
            tds = child.findChildren("td")
            if int(tds[0].text.split(", ")[-1]) > 2009:
                billList.append("https://justfacts.votesmart.org" + tds[3].findChild()['href'])
                
        # print(billList)
        
        
        session = ClientSession()
        
        if not os.path.exists("./bills/" + (loc + topic)):
            os.mkdir("./bills/" + (loc + topic))
        
        await asyncio.gather(*[loadBill(billURL, loc + topic, session) for billURL in billList])
        
        await session.close()
        return True
    except:
        print(loc + topic + " Failed")

import random

def getAlreadyClassified(topic):
    pos = os.listdir('./bills/' + topic + '/pos')
    neg = os.listdir('./bills/' + topic + '/neg')
    
    return ([i.split('.')[0] for i in pos], [i.split('.')[0] for i in neg])

def classify(topic):
    
    pos, neg = getAlreadyClassified(topic)
    
    if not os.path.exists("./bills/" + topic):
        os.mkdir("./bills/" + topic)
    if not os.path.exists("./bills/" + topic + "/pos"):
        os.mkdir("./bills/" + topic + "/pos")
    if not os.path.exists("./bills/" + topic + "/neg"):
        os.mkdir("./bills/" + topic + "/neg")
        
    d = []
    
    cnt = 0
        
    for state in STATES:
        try:
            files = os.listdir('./bills/' + (state + topic))
            
            for file in files:
                cur = (state + topic) + "/" + file
                form = "".join(cur.split('/')).split('.')[0]
                
                if not (form in pos or form in neg):
                    d.append(cur)
                else:
                    print(cur + " skipped")
                    cnt+=1
                        
        except:
            pass
        
    print(str(cnt) + " skipped")
    
    random.shuffle(d)
    
    for i in range(300):
        with open('./bills/' + d[i], 'r') as fin:
            data = json.load(fin)
            print(data["synopsis"] + " (" + "".join(d[i].split('/')).split('.')[0])
                                
            in_ = input("1 for Pos 2 for Neg: ")
            
            if in_ == '1':
                with open('./bills/' + topic + '/pos/' + "".join(d[i].split('/')).split('.')[0] + '.txt', 'w+') as fout:
                    fout.write(data["pg"])
            elif in_ == '2':
                with open('./bills/' + topic + '/neg/' + "".join(d[i].split('/')).split('.')[0] + '.txt', 'w+') as fout:
                    fout.write(data["pg"])
            else:
                print("oops on " + file)
            
            
def redo(topic):
    pos, neg = getAlreadyClassified(topic)
        
    for file in pos:
        with open('./bills/' + file[:len(topic) + 2] + '/' + file[len(topic) + 2:] + '.json', 'r') as fin:
            data = json.load(fin)
            with open('./bills/' + topic + '/pos/' + file + '.txt', 'w') as fout:
                fout.write(data["pg"])
                
    for file in neg:
        with open('./bills/' + file[:len(topic) + 2] + '/' + file[len(topic) + 2:] + '.json', 'r') as fin:
            data = json.load(fin)
            with open('./bills/' + topic + '/neg/' + file + '.txt', 'w') as fout:
                fout.write(data["pg"])
            
    
# GET search raw for a certain topic and state
# async def searchRaw(topic, session, state="ALL"):
  

ls = {"Env": 30, "Guns": 37}

if __name__ == "__main__":
    
    for state in STATES:
        asyncio.run(loadBills(state, "Env"))
    
    # redo("Guns")


    quit()
    
