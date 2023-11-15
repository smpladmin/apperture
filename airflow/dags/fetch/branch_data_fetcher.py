import requests

import requests
import gzip
import os
import tempfile


def download_file(link):
    response = requests.get(link)
    if response.status_code == 200:
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        with open(temp_file.name, "wb") as f:
            f.write(response.content)
        return temp_file.name
    return None


def extract_gzip(gzip_file):
    with gzip.open(gzip_file, "rt") as gz:
        return gz.read()


def save_to_temp_file(data, temp_dir, file_name):
    temp_file_path = os.path.join(temp_dir, file_name)
    with open(temp_file_path, "w") as temp_file:
        temp_file.write(data)
    return temp_file_path


def download_and_extract(links):
    temp_dir = tempfile.mkdtemp()
    result_dict = {}

    for topic, link_list in links.items():
        for link in link_list:
            temp_gz_file = download_file(link)

            if temp_gz_file:
                file_name = link.split("/")[-1].split("?")[0].replace(".gz", "")
                csv_data = extract_gzip(temp_gz_file)
                temp_file_path = save_to_temp_file(csv_data, temp_dir, file_name)
                result_dict[topic] = temp_file_path
                print(f"Temp file path created: {temp_file_path}")

    print(f"Dictionary {result_dict}")
    return result_dict


links_data = {
    # Your links here
}

x = download_and_extract(links_data)
# {
#     "eo_click": "/var/folders/mb/gdr4y0qx2yjfn4lkmhn9b_1r0000gn/T/tmpxdboiea1/1215946261392282019-2023-11-07-eo_click-v2-75ba93d7966039fd6272e8b6d37d489114f9d6c1f9195fcd3e610988fdd5882a-hIN1CD-0.csv",
#     "eo_custom_event": "/var/folders/mb/gdr4y0qx2yjfn4lkmhn9b_1r0000gn/T/tmpxdboiea1/1215946261392282019-2023-11-07-eo_custom_event-v2-7ba15689578093cc1f53ac2098ff54b605453842f9033ce347cd2972e65902cf-8VSesf-0.csv",
#     "eo_install": "/var/folders/mb/gdr4y0qx2yjfn4lkmhn9b_1r0000gn/T/tmpxdboiea1/1215946261392282019-2023-11-07-eo_install-v2-3742a135ba85acfa40035d2d4d8855fbc91fd1542196c9e2f9da9676da1caac7-X6yePO-0.csv",
#     "eo_open": "/var/folders/mb/gdr4y0qx2yjfn4lkmhn9b_1r0000gn/T/tmpxdboiea1/1215946261392282019-2023-11-07-eo_open-v2-e432799b57299622b2f5250c4b168592d516d5b68aeb2dc4f05248fa459c415b-7jfN6x-0.csv",
#     "eo_reinstall": "/var/folders/mb/gdr4y0qx2yjfn4lkmhn9b_1r0000gn/T/tmpxdboiea1/1215946261392282019-2023-11-07-eo_reinstall-v2-997b97d4280ef6b3bb54b4fe88ee5902403fa78ffad9c730d734e56973c5954a-KAiK3J-0.csv",
# }
