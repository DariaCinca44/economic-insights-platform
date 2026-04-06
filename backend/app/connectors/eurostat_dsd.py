import requests
import xml.etree.ElementTree as ET

BASE_DSD = "https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/datastructure/ESTAT"


def fetch_dsd_xml(dataset: str) -> str:
    url = f"{BASE_DSD}/{dataset}/latest"
    headers = {
        "Accept": "application/xml",
        "User-Agent": "economic-insights-platform/1.0"
    }
    r = requests.get(url, timeout=30, headers=headers)
    r.raise_for_status()
    return r.text


def extract_dimensions_order_from_xml(xml_text: str) -> list[dict]:
    root = ET.fromstring(xml_text)

    dim_list = None
    for el in root.iter():
        if el.tag.endswith("DimensionList"):
            dim_list = el
            break

    if dim_list is None:
        return []

    dims = []
    for child in list(dim_list):
        if child.tag.endswith("Dimension") or child.tag.endswith("TimeDimension"):
            dim_id = child.attrib.get("id")
            pos = child.attrib.get("position")

            codelist_id = None
            for sub in child.iter():
                if sub.tag.endswith("Ref") and sub.attrib.get("class") == "Codelist":
                    codelist_id = sub.attrib.get("id")
                    break

            dims.append({"id": dim_id, "position": pos, "codelist": codelist_id})

    dims.sort(key=lambda x: int(x["position"]) if x["position"] else 999)
    return dims
