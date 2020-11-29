# TrainGuide

An object detector model is used to find the handle/button of a train door and guidance for blind people is provided by sound cues.

## Model training

We opted for a MobileNet V2 of 320x320 for its relatively high speed, in order to reach real-time performances on mobile devices. The directory `model` contains Notebooks to train a model in Tensorflow from a pre-trained model found on the _TensorFlow 2 Detection Model Zoo_. A script is then used to convert the exported model for use with Tensorflow JS in a web browser.

## WebApp

The trained model is used on a real time video captured from the device camera to find the positions of doors (closed or opened), buttons and handles.
[...]
