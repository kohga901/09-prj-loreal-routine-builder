L’Oréal is expanding what’s possible with AI, and now your chatbot is getting smarter. This week, you’ll upgrade it into a product-aware routine builder. 
Users will be able to browse real L’Oréal brand products, select the ones they want, and generate a personalized routine using AI. They can also ask follow-up questions about their routine, just like chatting with a real advisor.

Project Steps Overview:
Click this starter file link to launch your own Codespace. Your starter code includes:
HTML structure for the category dropdown, product grid, selected products section, and chat area.
A products.json file that contains real product data from L’Oréal brands including CeraVe, L’Oréal Paris, Garnier, Lancôme, and more.
CSS styles for layout and basic design.
JavaScript that loads product data, filters it by category, and displays matching products.
JavaScript placeholders for selecting products, generating routines, and continuing the conversation in the chat window.
A “Generate Routine” button that you will connect to your AI logic.

Bring your own style to the project. Use L’Oréal’s brand colors (#ff003b and #e3a535), and thoughtful visual design choices to make your version feel unique and refined. This is your chance to make your work stand out!

Enable Product Selection
Let users select or unselect a product by clicking on its card.
Visually mark selected products in the grid (e.g., with a border or highlight).
Update the “Selected Products” section as items are added or removed.
Allow users to remove items directly from the list as well.


Reveal Product Description
Display each product's description in a clear, accessible way. 
This could be through a hover overlay, toggle button, modal window, expanded card, or other thoughtful UI pattern.

Generate a Personalized Routine. When the user clicks the "Generate Routine" button:
Collect only the selected products.
Send the JSON data for each selected product (like name, brand, category, and description) to the OpenAI API to generate a routine.
Display the AI-generated routine in the chat window.

Follow Up in the Chatbox
After the routine is generated, users should be able to ask follow-up questions in the chatbox.
These questions should relate only to the generated routine or to topics like skincare, haircare, makeup, fragrance, and other related areas.
The chatbot should remember the full conversation history so it can respond with relevant answers.

Save Selected Products
Use localStorage to remember which products the user selected, so their list stays visible even after a page reload. 
Users should be able to remove individual items from the saved list or clear all selections at once.

Use Your Cloudflare Worker
If you already have a Cloudflare Worker set up, continue using it for this project. If not, create one now, store your API key securely, and deploy it.
Make sure your script sends requests to your Worker endpoint and returns valid responses.

Ready for a LevelUp? (25 pts extra credit)
Add Web Search (10 pts): Update your chatbot to use a model that can search the web in real time. The AI’s responses should include current information related to L’Oréal products or routines, along with any links or citations it returns. This may require  updating your Cloudflare Worker or creating a new one for this project.
Add Product Search (10 pts): Add a search field that lets users filter through products by name or keyword. As they type, show only the matching products in the grid. This should work alongside the category filter for a seamless browsing experience.
Add RTL Language Support (5 pts): Update your layout to support right-to-left (RTL) languages. Apply layout and text direction changes so the routine builder works correctly in RTL mode. Make sure the product grid, selected products section, and chat interface all adjust accordingly.
Test & Submit
Use DevTools to check functionality and responsiveness across different screen sizes.
Commit and push your changes to GitHub.
Deploy your site and submit the live link. Ensure your link works correctly by testing in an incognito or private browser.


Reflect on your experience and prepare for job interviews and professional networking by answering all the questions below.
