# Model training

The notebook `TrainGuide.ipynb` trains a model from the whole dataset using Tensorflow Object Detection API.

The data is first splitted in train and test sets using [cocosplit](https://github.com/akarazniewicz/cocosplit.git), then converted into `tfrecord` format. The modified `create_coco_tf_record.py` given here has to be used to deal with 0-sized images...

The model `ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8` obtained from the [TensorFlow 2 Detection Model Zoo](https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/tf2_detection_zoo.md) is used as a starting point for training. The customized `pipeline.config` is given here.

The files `TrainGuide_tiny.ipynb` and `pipeline_tiny.config` were used to train on a small subset (200 images) of the whole dataset for time constraints reasons, resulting in the exported model in `saved_model`, which is far from robust (for now!)

The script `convert.sh`converts a Tensorflow `saved_model` into a Tensorflow JS `web_model` ready to be used in the webapp.
