DOMAIN_CONFIG = {
    "food": {
        "label" : "Alimentar",
        "inflation" : {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key" : "M.I15.CP01.RO",
            "title" : "Inflatie (HICP) - Alimentar",
            "ttl_hours": 24
        },
        "consumption" : {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_FOOD.SCA.I15.RO",
            "title": "Consum (Retail vol.) - Alimentar",
            "ttl_hours": 24
        }
    },
    "tech":{
        "label": "Tehnologic",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP08.RO",
            "title": "Inflatie (HICP) - Tech",
            "ttl_hours": 24
        },
        "consumption": {
            "source" : "eurostat",
            "dataset" : "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD.SCA.I15.RO",
            "title": "Consum (Retail vol.) - Tech",
            "ttl_hours": 24
        }
    }
}