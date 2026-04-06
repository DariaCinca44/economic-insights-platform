DOMAIN_CONFIG = {
    "CP01": {
        "label": "Alimente si bauturi nealcoolice",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP01.RO",
            "title": "Inflatie - Alimentar",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_FOOD.SCA.I15.RO",
            "title": "Consum Retail - Alimentar",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["supermarket", "alimente", "mancare", "cumparaturi"],
            "title": "Interes Cautari: Supermarket"
        }
    },
    "CP02": {
        "label": "Bauturi alcoolice si tutun",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP02.RO",
            "title": "Inflatie - Alcool & Tutun",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_FOOD.SCA.I15.RO",
            "title": "Consum Retail - Alcool & Tutun",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["tigari", "alcool", "vin", "bere"],
            "title": "Interes Cautari: Tigari"
        }
    }, "CP03": {
        "label": "Imbracaminte si incaltaminte",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP03.RO",
            "title": "Inflatie - Imbracaminte",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD.SCA.I15.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["haine", "incaltaminte", "geci", "rochie", "pantofi"],
            "title": "Interes Cautari: Fashion"
        }
    }, "CP04": {
        "label": "Locuinta, apa, electricitate, gaze",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP04.RO",
            "title": "Inflatie - Utilitati",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD.SCA.I15.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["factura curent", "pret gaze", "intretinere", "chirie"],
            "title": "Interes Cautari: Utilitati"
        }
    }, "CP05": {
        "label": "Mobilier si echipament casnic",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP05.RO",
            "title": "Inflatie - Mobilier",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD.SCA.I15.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["mobila", "canapea", "electrocasnice", "dedeman"],
            "title": "Interes Cautari: Casa & Mobilier"
        }
    }, "CP06": {
        "label": "Sanatate",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP06.RO",
            "title": "Inflatie - Sanatate",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD.SCA.I15.RO",
            "title": "Consum Retail - Non-Food ",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["farmacie", "medicamente", "clinica", "analize"],
            "title": "Interes Cautari: Sanatate"
        }
    }, "CP07": {
        "label": "Transport",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP07.RO",
            "title": "Inflatie - Transport",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G473.SCA.I15.RO",
            "title": "Consum Retail - Carburanti",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["pret benzina", "motorina", "bilete tren", "zboruri"],
            "title": "Interes Cautari: Transport"
        }
    }, "CP08": {
        "label": "Comunicatii",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP08.RO",
            "title": "Inflatie - Comunicatii",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD.SCA.I15.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["abonament telefon", "internet", "telefon nou"],
            "title": "Interes Cautari: Comunicatii"
        }
    }, "CP09": {
        "label": "Recreere si cultura",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP09.RO",
            "title": "Inflatie - Recreere",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD.SCA.I15.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["bilete concert", "cinema", "carti", "festival"],
            "title": "Interes Cautari: Recreere"
        }
    }, "CP10": {
        "label": "Educatie",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP10.RO",
            "title": "Inflatie - Educatie",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD.SCA.I15.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["cursuri", "facultate", "meditatii", "rechizite"],
            "title": "Interes Cautari: Educatie"
        }
    }, "CP11": {
        "label": "Restaurante si hoteluri",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP11.RO",
            "title": "Inflatie - HoReCa",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD.SCA.I15.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["restaurant", "cazare", "hotel", "booking", "food delivery"],
            "title": "Interes Cautari: HoReCa"
        }
    }, "CP12": {
        "label": "Diverse bunuri si servicii",
        "inflation": {
            "source": "eurostat",
            "dataset": "prc_hicp_midx",
            "key": "M.I15.CP12.RO",
            "title": "Inflatie - Diverse",
            "ttl_hours": 24
        },
        "consumption": {
            "source": "eurostat",
            "dataset": "sts_trtu_m",
            "key": "M.VOL_SLS.G47_NFOOD.SCA.I15.RO",
            "title": "Consum Retail - Non-Food",
            "ttl_hours": 24
        },
        "trends": {
            "keywords": ["asigurare", "salon", "banca", "credit"],
            "title": "Interes Cautari: Diverse"
        }
    }
}
