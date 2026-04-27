const token = 'napi_ndwb5p47h4l156fcqqxzla589xl609zb9cdbbe6utycvkezu9lwk86kbs9x6ocbe';
fetch('https://console.neon.tech/api/v2/projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ project: { name: 'food_ordering' } })
})
.then(res => res.json())
.then(data => {
  if (data.connection_uris && data.connection_uris.length > 0) {
    console.log("DB_URI=" + data.connection_uris[0].connection_uri);
  } else {
    console.log("FULL_RESPONSE=" + JSON.stringify(data));
  }
})
.catch(err => console.error(err));
