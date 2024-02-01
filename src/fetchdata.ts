import { GodisResponse, FetchDataResponse } from "./bortakvall.types";

const apiUrl = "https://www.bortakvall.se/api/v2/products";
let fetchedData: GodisResponse[];

//Hämtar data från API
export async function fetchData() {
  try {
    const response = await fetch(apiUrl);
    //säkerställer att responsen är ok, först då hämtar vi ut data och returnar fetchedData.
    if (response.ok) {
      //typa svaret  const data: GodisResponse = await response.json();
      const data: FetchDataResponse = await response.json();
      fetchedData = data.data;

      return fetchedData;
    } else {
      alert(`Förfrågan misslyckades med statuskod: ${response.status}`);
    }
  } catch (error) {
    alert(error);
  }
}
export { fetchedData };
