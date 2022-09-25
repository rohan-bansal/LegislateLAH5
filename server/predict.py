from tensorflow.keras.preprocessing.sequence import pad_sequences
import tensorflow as tf
import os
import json
import pickle
import sys

gpu_devices = tf.config.experimental.list_physical_devices('GPU')
for device in gpu_devices:
    tf.config.experimental.set_memory_growth(device, True)

folder = "./model_data"
model = tf.keras.models.load_model("attempt_3_works.h5")
tokenizer = ""
vals = ["Positive", "Negative"]

with open('tokenizer.pickle', 'rb') as handle:
    tokenizer = pickle.load(handle)


def predict(text):
    tw = tokenizer.texts_to_sequences([text])
    tw = pad_sequences(tw, maxlen=200)
    prediction = int(model.predict(tw).round().item())

    conf = min(prediction, 1 - prediction)

    with open("./log.txt", "w") as f:
        f.write(f"{vals[prediction]} {conf} {text}")

    return conf, vals[prediction]


STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
          "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "NA"]


def clean(topic):
    for state in STATES:
        files = os.listdir('./bills/' + (state + topic))

        for file in files:
            with open('./bills/' + (state + topic) + '/' + file, 'r') as fin:
                data = json.load(fin)

                if 'pg' not in data.keys():
                    data['pg'] = data['synopsis']
                conf1, pred1 = predict(data['pg'])

                data['pred'] = pred1
                print(file)

                with open('./bills/' + (state + topic) + '/' + file, 'w') as fout:
                    fout.write(json.dumps(data, ensure_ascii=False))


clean("Guns")
