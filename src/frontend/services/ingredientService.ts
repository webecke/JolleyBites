export const doTestPut = async () => {
  const response = await fetch(generateBaseUrl() + "/api/ingredients", {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ingredient: {
        user_id: "GENERIC",
        name: "Flour2",
        quantity: 10420,
        unit: "cupsssssss",
        purchasePrice: 5,
        pricePerUnit: 5444,
        notes: "fake another"
      }
    })
  });

  if (!response.ok) {
    console.error('Error:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('Error details:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  console.log(await response.text())
  console.log(await response.headers)
  console.log(await response.body)
  console.log(response)
  return "success";
};

export const doNathanGet = async () => {
  const response = await fetch(generateBaseUrl() + "/nathan", {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Error:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('Error details:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  console.log(await response.text())
  console.log(await response.headers)
  console.log(await response.body)
  console.log(response)
  return "success";
};

function generateBaseUrl() {
  let baseUrl = window.location.origin
  if (baseUrl.startsWith("http://localhost")) {
    baseUrl = "http://localhost:8787"
  }
  return baseUrl
}