import tensorflow as tf
import os
import json
import pickle

from tensorflow.keras.preprocessing.sequence import pad_sequences

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

    return (conf, vals[prediction])


STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
          "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "NA"]


def clean(topic):
    for state in STATES:
        try:
            files = os.listdir('./bills/' + (state + topic))

            for file in files:
                with open('./bills/' + (state + topic) + '/' + file, 'r') as fin:
                    data = json.load(fin)
                    conf1, pred1 = predict(data['pg'])
                    conf2, pred2 = predict(data['synopsis'])

                    if conf1 < conf2:
                        data['pred'] = pred1
                    else:
                        data['pred'] = pred2

        except:
            pass


clean("Guns")
