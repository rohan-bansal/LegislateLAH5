import json
import os


STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
          "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "NA"]

def clean(topic):    
    
    with open('./us-states.json', 'r') as fin:
        geo = json.load(fin)
    
        for state in STATES:
            
            thing = {"PosPas": 0, "PosTot": 0, "NegPas": 0, "NegTot": 0}
            # cnt = {"Pro": 0, "Nay": 0}
            par = {"RepPro": 0, "RepTot": 0, "DemPro": 0, "DemTot": 0}
            track = {}
            
            files = os.listdir('./bills/' + (state + topic))
            
            for file in files:
                with open('./bills/' + (state + topic) + '/' + file, 'r') as fin:
                    data = json.load(fin)
                    
                    pos = (data['pred'] == "Positive")
                    # if pos:
                    #     cnt["Pro"] += 1
                    # else:
                    #     cnt["Nay"] += 1
                        
                    yes = 0
                    no = 0
                    
                    for s, pp in data["votes"].items():
                        
                        for p in pp:
                        
                            if p[1] not in track.keys():
                                track[p[1]] = 0
                            
                            if s == "Yes":
                                yes += 1
                                track[p[1]] += (1 if pos else -1)
                                if p[2] == "Republican":
                                    if pos:
                                        par["RepPro"]+=1
                                    par["RepTot"]+=1
                                elif p[2] == "Democratic":
                                    if pos:
                                        par["DemPro"]+=1
                                    par["DemTot"]+=1
                            
                            elif s == "No":
                                no += 1
                                track[p[1]] += (-1 if pos else 1)
                            
                    if pos:
                        thing["PosTot"] += 1
                        if yes > no:
                            thing["PosPas"] += 1
                    else:
                        thing["NegTot"] += 1
                        if yes > no:
                            thing["NegPas"] += 1
                            
            for dd in geo["features"]:
                if dd["id"] == state:
                    tracked = {"Pos": 0, "Neu": 0, "Neg": 0}
                    
                    for person, score in track.items():
                        if score > 0: 
                            tracked["Pos"] += 1
                        elif score < 0:
                            tracked["Neg"] += 1
                        else:
                            tracked["Neu"] += 1
                    
                    dd["properties"]["data"] = {"Party": par, "Total": thing, "Person": tracked}
                            
            
        with open('./us-states.json', 'w') as fout:
            fout.write(json.dumps(geo, ensure_ascii=False))
                
    #     d[state] = statetot
        
    # with open("data/mapdata.json", 'w+') as fout:
    #     fout.write(json.dumps(d, ensure_ascii=False))
                        
clean("Guns")