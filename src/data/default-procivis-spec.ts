
import { ProcivisOneSchema } from "../types/procivis-one-spec";

export const defaultProcivisOneSchema: ProcivisOneSchema = {
  "id": "",
  "createdDate": "",
  "lastModified": "",
  "name": "Pet Permit",
  "format": "SD_JWT",
  "revocationMethod": "NONE",
  "organisationId": "",
  "claims": [
    {
      "id": "",
      "createdDate": "",
      "lastModified": "",
      "key": "Firstname",
      "datatype": "STRING",
      "required": true,
      "array": false,
      "claims": []
    },
    {
      "id": "",
      "createdDate": "",
      "lastModified": "",
      "key": "Lastname",
      "datatype": "STRING",
      "required": true,
      "array": false,
      "claims": []
    },
    {
      "id": "",
      "createdDate": "",
      "lastModified": "",
      "key": "Street",
      "datatype": "STRING",
      "required": true,
      "array": false,
      "claims": []
    },
    {
      "id": "",
      "createdDate": "",
      "lastModified": "",
      "key": "City",
      "datatype": "STRING",
      "required": true,
      "array": false,
      "claims": []
    },
    {
      "id": "",
      "createdDate": "",
      "lastModified": "",
      "key": "Country",
      "datatype": "STRING",
      "required": true,
      "array": false,
      "claims": []
    },
    {
      "id": "",
      "createdDate": "",
      "lastModified": "",
      "key": "Pets",
      "datatype": "OBJECT",
      "required": true,
      "array": true,
      "claims": [
        {
          "id": "",
          "createdDate": "",
          "lastModified": "",
          "key": "Race",
          "datatype": "STRING",
          "required": true,
          "array": false,
          "claims": []
        },
        {
          "id": "",
          "createdDate": "",
          "lastModified": "",
          "key": "Name",
          "datatype": "STRING",
          "required": true,
          "array": false,
          "claims": []
        }
      ]
    }
  ],
  "walletStorageType": "SOFTWARE",
  "schemaId": "",
  "schemaType": "ProcivisOneSchema2024",
  "importedSourceUrl": "",
  "layoutType": "CARD",
  "layoutProperties": {
    "background": {
      "color": "#2C75E3"
    },
    "logo": {
      "image": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGbSURBVHgBvVaBUcMwDFQ4BjAbmA06QjYgGzQbkA1aJmg3yHWCwgSGCVImcJkg3UDYjVMUI6VxW/g7X+701kuWZTsAI0DEwo0GO9RuKMKpYGvdsH4uXALnqPE3DOFrhs8hFc5pizxyN2YCZyS9+5FYuWCfgYzZJYFUon2UuwMZ+xG7xO3gXKBQ95xwGyHIuxuvbhwY/oPo+WbSQAyKtDCGVtWM3aMifmXENcGnb3uqp6Q2NZHgEpnWDQl5rsJwxgS9NTBZ98ghEdgdcA6t3yOpJQtGSIUVekHN+DwJWsfSWSGLmsm2xWHti2iOEbQav6I3IYtPIqDdZwvDc3K0OY5W5EvQ2vUb2jJZaBLIogxL5pUcf9LC7gzZQPigJXFe4HmsyPw1sRvk9jKsjj4Fc5yOOfFTyDcLcEGfMR0VpACnlUvC4j+C9FjFulkURLuPhdvgIcuy08UbPxMabofBjRMHOsAfIS6db21fOgXXYe/K9kgNgxWFmr7A9dhMmoXD001h8OcvSPpLWkIKsLu3THC2yBxG7B48S5IoJb1vHubbPPxs2qsAAAAASUVORK5CYII=",
      "fontColor": "#fff",
      "backgroundColor": "#2C75E3"
    },
    "primaryAttribute": "Firstname",
    "secondaryAttribute": "Lastname"
  },
  "allowSuspension": false,
  "externalSchema": false
};
