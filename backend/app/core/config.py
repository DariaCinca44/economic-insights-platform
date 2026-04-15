DOMAIN_CONFIG = {
    "CP01": {
        "label": "Alimente si bauturi nealcoolice",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP01.RO",
            "title": "Inflatie - Alimentar",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_FOOD.NSA.I21.RO",
            "title": "Consum Retail - Alimentar",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["supermarket", "alimente", "mancare", "cumparaturi"],
            "title": "Interes Cautari: Supermarket",
            "ttl_hours": 8760
        }
    },
    "CP02": {
        "label": "Bauturi alcoolice si tutun",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP02.RO",
            "title": "Inflatie - Alcool & Tutun",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_FOOD.NSA.I21.RO",
            "title": "Consum Retail - Alcool & Tutun",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["tigari", "alcool", "vin", "bere"],
            "title": "Interes Cautari: Tigari",
            "ttl_hours": 8760
        }
    }, "CP03": {
        "label": "Imbracaminte si incaltaminte",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP03.RO",
            "title": "Inflatie - Imbracaminte",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G477.NSA.I21.RO",
            "title": "Consum Retail - Imbracaminte",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["haine", "incaltaminte", "rochie", "pantofi"],
            "title": "Interes Cautari: Fashion",
            "ttl_hours": 8760
        }
    }, "CP04": {
        "label": "Locuinta, apa, electricitate, gaze",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP04.RO",
            "title": "Inflatie - Utilitati",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD_X_G473.NSA.I21.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["factura curent", "pret gaze", "intretinere", "chirie"],
            "title": "Interes Cautari: Utilitati",
            "ttl_hours": 8760
        }
    }, "CP05": {
        "label": "Mobilier si echipament casnic",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP05.RO",
            "title": "Inflatie - Mobilier",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G475.NSA.I21.RO",
            "title": "Consum Retail - Mobilier & Aparate",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["mobila", "canapea", "electrocasnice", "dedeman"],
            "title": "Interes Cautari: Casa & Mobilier",
            "ttl_hours": 8760
        }
    }, "CP06": {
        "label": "Sanatate",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP06.RO",
            "title": "Inflatie - Sanatate",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G477.NSA.I21.RO",
            "title": "Consum Retail - Farmaceutice",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["farmacie", "medicamente", "clinica", "analize"],
            "title": "Interes Cautari: Sanatate",
            "ttl_hours": 8760
        }
    }, "CP07": {
        "label": "Transport",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP07.RO",
            "title": "Inflatie - Transport",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G473.NSA.I21.RO",
            "title": "Consum Retail - Carburanti",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["pret benzina", "motorina", "bilete tren", "zboruri"],
            "title": "Interes Cautari: Transport",
            "ttl_hours": 8760
        }
    }, "CP08": {
        "label": "Comunicatii",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP08.RO",
            "title": "Inflatie - Comunicatii",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G474.NSA.I21.RO",
            "title": "Consum Retail - Echipamente IT",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["abonament telefon", "internet", "telefon nou"],
            "title": "Interes Cautari: Comunicatii",
            "ttl_hours": 8760
        }
    }, "CP09": {
        "label": "Recreere si cultura",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP09.RO",
            "title": "Inflatie - Recreere",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G476.NSA.I21.RO",
            "title": "Consum Retail - Bunuri culturale",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["bilete concert", "cinema", "carti", "festival"],
            "title": "Interes Cautari: Recreere",
            "ttl_hours": 8760
        }
    }, "CP10": {
        "label": "Educatie",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP10.RO",
            "title": "Inflatie - Educatie",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD_X_G473.NSA.I21.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["cursuri", "facultate", "meditatii", "rechizite"],
            "title": "Interes Cautari: Educatie",
            "ttl_hours": 8760
        }
    }, "CP11": {
        "label": "Restaurante si hoteluri",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP11.RO",
            "title": "Inflatie - HoReCa",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD_X_G473.NSA.I21.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["restaurant", "cazare", "hotel", "booking"],
            "title": "Interes Cautari: HoReCa",
            "ttl_hours": 8760
        }
    }, "CP12": {
        "label": "Diverse bunuri si servicii",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP12.RO",
            "title": "Inflatie - Diverse",
            "ttl_hours": 168
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G477.NSA.I21.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 168
        },
        "trends": {
            "keywords": ["asigurare", "salon", "banca", "credit"],
            "title": "Interes Cautari: Diverse",
            "ttl_hours": 8760
        }
    }
}
