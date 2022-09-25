import json
import os

STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
          "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "NA"]

def clean(topic):
    d = {}
    
    for state in STATES:
        try:
            files = os.listdir('./bills/' + (state + topic))
            
            for file in files:
                with open('./bills/' + (state + topic) + '/' + file, 'r') as fin:
                    data = json.load(fin)
                    
                    votes = data['votes']
                    
                    for vote, ppl in votes.items():
                        for person in ppl:
                            person = [" ".join(i.split()) for i in person]
                                                        
                            if person[0] not in d.keys():
                                d[person[0]] = {"info": person[1:], "votes": []}
                                
                            d[person[0]]["votes"].append({"link": data["link"], "vote": vote})
                    
        except:
            print("Rip " + state)
            
    with open("./data/" + topic + "people.json", 'w+') as fout:
        fout.write(json.dumps(d, ensure_ascii=False))
        
        
def refs(topic):
    
    d = {}
    
    for state in STATES:
        # try:
        files = os.listdir('./bills/' + (state + topic))
        
        for file in files:
            with open('./bills/' + (state + topic) + '/' + file, 'r') as fin:
                data = json.load(fin)
                                
                if 'pg' not in data.keys():
                    data['pg'] = data['synopsis']
                
                # print(file)
                
                d[data["link"]] = {"synopsis": data["synopsis"], "pg": data["pg"], "name": data["name"], "pred": data["pred"]}
        # except:
        #     print("Rip " + state)
            
    with open("./data/" + topic + "billref.json", 'w+') as fout:
        fout.write(json.dumps(d, ensure_ascii=False))
        
       
from functools import lru_cache
 
def lev_dist(a, b):
    
    @lru_cache(None)  # for memorization
    def min_dist(s1, s2):

        if s1 == len(a) or s2 == len(b):
            return len(a) - s1 + len(b) - s2

        # no change required
        if a[s1] == b[s2]:
            return min_dist(s1 + 1, s2 + 1)

        return 1 + min(
            min_dist(s1, s2 + 1),      # insert character
            min_dist(s1 + 1, s2),      # delete character
            min_dist(s1 + 1, s2 + 1),  # replace character  
        )

    return min_dist(0, 0)

def name_lev_dist(topic):
    with open("./data/" + topic + "people.json", 'r') as fin:
        data = json.load(fin)
        people = list(data.keys())
    
    with open("./data/allpeople.json", 'w+') as fout:
        fout.write(json.dumps(people, ensure_ascii=False))
            
if __name__ == "__main__":
    # name_lev_dist("Guns")
    # print(lev_dist("test", "tat"))
    
    refs("Guns")
