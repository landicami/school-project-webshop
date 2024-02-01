// import { GodisPost } from "./bortakvall.types";
import { formDataTyp } from "./bortakvall.types.ts";
import { confirmpage, confirmpage2 } from "./main.ts";

const postApi = "https://www.bortakvall.se/api/v2/users/33/orders";

// Funktion för att skicka formulärdata till API:et
export const sendFormDataToApi = async (formData: formDataTyp) => {
  try {
    // Skicka formulärdata till API:et
    const res = await fetch(postApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // Kontrollera om förfrågan var framgångsrik
    if (res.ok) {
      const responseBody: { data: { id?: number } } = await res.json();
      const orderid = responseBody.data.id;
      if (!orderid) {
        confirmpage2!.innerHTML = `<h2>Din beställning gick inte igenom. Felmeddelande ${res.status}<br>Försök igen senare</h2>`;
        confirmpage?.classList.remove("d-none");
        return;
      }
      confirmpage2!.innerHTML = `<h2>Tack för din beställning!<br> Ditt ordernummer är ${orderid}</h2>`;
      confirmpage?.classList.remove("d-none");
    } else {
      confirmpage2!.innerHTML = `<h2>Din beställning gick inte igenom. Felmeddelande ${res.status}<br>Försök igen senare</h2>`;
      confirmpage?.classList.remove("d-none");
    }
  } catch (error) {
    console.error("Ett fel uppstod:", error);
  }
};
