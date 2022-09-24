from aiohttp import ClientSession
import json
import asyncio
import time
import os
from nltk.tokenize import word_tokenize
from nltk import ngrams, FreqDist

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
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "US"]


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


LIST = ["abortion", "marijuana", "tariffs", "minimum wage", "gun", "gay", "vote by mail", "affirmative action", "government funded health insurance", "military budget"]


if __name__ == "__main__":

    # Search topic
    
    for item in LIST[7:]:
        asyncio.run(searchTopic(item))
        
        updateBillList(item)
        
        # break
        
        # asyncio.run(processBillsTopic(item))

    quit()
    
    
    
    
    
# async def getSession(state, session):
#     url = "https://api.legiscan.com/?key={}&op=getSessionList&state={}".format(
#         KEY, state)

#     r = await session.request(method='GET', url=url)
#     s = await r.text()
#     json_data = json.loads(s)

#     return json_data

# # get people from a session


# async def getSessionPeople(session_id, session):
#     url = "https://api.legiscan.com/?key={}&op=getSessionPeople&id={}".format(
#         KEY, session_id)

#     r = await session.request(method='GET', url=url)
#     s = await r.text()
#     json_data = json.loads(s)

#     return json_data

# # get sponsored


# async def getSponsored(people_id, session):
#     url = "https://api.legiscan.com/?key={}&op=getSponsoredList&id={}".format(
#         KEY, people_id)

#     r = await session.request(method='GET', url=url)
#     s = await r.text()
#     json_data = json.loads(s)

#     return json_data


# # get people from state
# async def getPeopleFromState(state, session):
#     t = time.time()
#     print("Searching for legislators from: " + state)

#     # get state sessions
#     json_data = await getSession(state, session)

#     # create path
#     if not os.path.exists("./states/" + state + "/"):
#         os.mkdir("./states/" + state + "/")

#     # write sessions
#     with open("states/" + state + "/sessions.json", "w+") as fout:
#         json.dump(json_data, fout)

#     # last state session
#     last_session_id = json_data['sessions'][0]['session_id']

#     print("Last session id: " + str(last_session_id))

#     print("Parsing people from session " + str(last_session_id))

#     # get people from last state session
#     json_data = await getSessionPeople(last_session_id, session)

#     # write people
#     with open("states/" + state + "/people.json", "w+") as fout:
#         json.dump(json_data, fout)

#     # unused: write each person to a file
#     '''
#     if not os.path.exists("./states/" + state + "/sen/"):
#         os.mkdir("./states/" + state + "/sen/")
#     if not os.path.exists("./states/" + state + "/rep/"):
#         os.mkdir("./states/" + state + "/rep/")
    
#     for person in json_data["sessionpeople"]["people"]:
#         if(person["last_name"] != ""):
#             name = person["last_name"]+","+person["first_name"]+"("+person["party"]+")"
#             if(person["role"] == "Sen"):
#                 with open("./states/" + state + "/sen/" + name + ".json", "w+") as fout:
#                     json.dump(person, fout)
#             else:
#                 with open("./states/" + state + "/rep/" + name + ".json", "w+") as fout:
#                     json.dump(person, fout)
#     '''

#     print(state + " completed in " + str(time.time() - t) + "s")

# # get all legislators from 50 states + DC + Federal


# async def getAllPeople():
#     async with ClientSession() as session:
#         await asyncio.gather(*[getPeopleFromState(state, session) for state in STATES])
#     return True

# # search for a legislator


# def findPerson(name):
#     with open('states/allpeople.json', "r") as fin:
#         json_data = json.load(fin)
#         return json_data[name]

# # search for a legislator


# def findPersonN(people_id):
#     with open('states/allpeoplen.json', "r") as fin:
#         json_data = json.load(fin)
#         return json_data[str(people_id)]


# def collectAllPeople():
#     d = {}
#     for state in STATES:
#         print("Searching from " + state)
#         with open("states/" + state + "/people.json", "r") as fin:
#             json_data = json.load(fin)

#             if("people" in json_data["sessionpeople"].keys()):
#                 for person in json_data["sessionpeople"]["people"]:

#                     d[person["name"]] = person

#     json_data = json.dumps(d)
#     json_data = json.loads(json_data)

#     with open('states/allpeople.json', "w+") as fout:
#         json.dump(json_data, fout)


# def collectAllPeopleN():
#     d = {}
#     for state in STATES:
#         print("Searching from " + state)
#         with open("states/" + state + "/people.json", "r") as fin:
#             json_data = json.load(fin)

#             if("people" in json_data["sessionpeople"].keys()):
#                 for person in json_data["sessionpeople"]["people"]:

#                     d[person["people_id"]] = person

#     json_data = json.dumps(d)
#     json_data = json.loads(json_data)

#     with open('states/allpeoplen.json', "w+") as fout:
#         json.dump(json_data, fout)


# async def getBill2(billID, bills, session):
#     print("Requesting " + str(billID))
#     t = time.time()

#     # GET from API
#     url = "https://api.legiscan.com/?key={}&op=getBill&id={}".format(
#         KEY, billID)

#     r = await session.request(method='GET', url=url)
#     s = await r.text()
#     json_data = json.loads(s)

#     bills.append(json_data)

#     print(str(billID) + " completed in " + str(time.time() - t) + "s")
#     return json_data


# # use async to get a list of bills
# async def getBills2(billList, bills, session):
#     await asyncio.gather(*[getBill2(billID, bills, session) for billID in billList])
#     return True


# async def getTopicDetails(topic, relevanceCutoff=0, state="US"):

#     billList = await searchTopic(topic, relevanceCutoff, state)

#     for bill in billList:
#         with open("./bills/" + topic + "/" + str(bill) + ".json", "r") as fin:
#             json_data = json.load(fin)

#             for sponsor in json_data["bill"]["sponsors"]:
#                 print(sponsor["name"], sponsor["party"])


# # loop through spnsored bills
# async def getSponsoredBills(person):

#     session = ClientSession()

#     person = findPerson(person)

#     json_data = await getSponsored(person["people_id"], session)

#     billIDs = []

#     for bill in json_data["sponsoredbills"]["bills"]:
#         billIDs.append(bill['bill_id'])

#     bills = []

#     await getBills2(billIDs, bills, session)

#     #print(", ".join(str(bill["bill"]["title"]) for bill in bills))

#     await session.close()

#     return bills


# async def analyzeSponsoredBills(person):
#     bills = await getSponsoredBills(person)

#     total = ""

#     for bill in bills:
#         total += bill["bill"]["title"] + " "

#     exclude = set(string.punctuation)
#     total = ''.join(ch for ch in total if ch not in exclude)

#     tokens = word_tokenize(total)

#     while "Relative" in tokens:
#         tokens.remove("Relative")

#     all_counts = dict()
#     for size in 2, 5, 7:
#         all_counts[size] = FreqDist(ngrams(tokens, size))

#     for size in 2, 5, 7:

#         for i in all_counts[size].most_common(50):
#             print(" ".join(i[0]), i[1])
