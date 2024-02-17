import requests
import json

filename = "gameList.json"
url = "https://steamspy.com/api.php?request=top100forever"
response = requests.get(url)
response_dict = response.json()

with open(filename, "w", encoding="utf-8") as f:
    index_dict = 0
    f.write("{")
    for key in response_dict.keys():
        gameName = response_dict[key]["name"]
        gameID = response_dict[key]["appid"]
        game_dict = {
            "name": gameName,
            "appid":gameID
        }
        f.write(f"\"{str(index_dict)}\":"+ json.dumps(game_dict, indent=4))
        if(index_dict != len(response_dict.keys())-1):
            f.write(",")
        f.write("\n")
        index_dict+=1
    f.write("}")

print("Game list updated")
