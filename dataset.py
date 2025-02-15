import tensorflow as tf
import numpy as np
import tensorflow_datasets as tfds
import matplotlib.pyplot as plt
import matplotlib.pyplot as plt
import cv2

# Load a sample image
sample_image_path = "your_path_to_image.jpg"  # Replace with an actual image path
image = cv2.imread(sample_image_path)
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert from BGR to RGB

# Display the image
plt.imshow(image)
plt.axis("off")
plt.title("Sample Image")
plt.show()
