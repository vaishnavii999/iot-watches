{
  "organisation" : {
    "organisation-id": 1,
    "organisation-name": "HealthWatch Technologies",
    "users": [
      {
        "user-id": 101,
        "user-name": "Vaishnavi",
        "age": 20,
        "heart-rate": 78,
        "blood-pressure": "120/80",
        "contacts": [
          "9876543210",
          "9123456780"
        ],
        "watch-id": 501,
        "update-installation": true
      },
      {
        "user-id": 102,
        "user-name": "Rahul",
        "age": 25,
        "heart-rate": 82,
        "blood-pressure": "125/82",
        "contacts": [
          "9988776655"
        ],
        "watch-id": 502,
        "update-installation": false
      }
    ],
    "watches": [
      {
        "watch-id": 501,
        "user-id": 101,
        "configuration": 1,
        "model-name": "HealthWatch Pro"
      },
      {
        "watch-id": 502,
        "user-id": 102,
        "configuration": 2,
        "model-name": "HealthWatch Lite"
      }
    ],
    "software-updates": [
      {
        "update-id": 1001,
        "version-number": "2.1.0",
        "watch-id": 501,
        "installation-status": true
      },
      {
        "update-id": 1002,
        "version-number": "2.1.0",
        "watch-id": 502,
        "installation-status": false
      }
    ]
  }
}