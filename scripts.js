// Function to initialize the page
function initializePage() {
  // Audio div functionality
  function setupVoiceCommands() {
    if (annyang) {
      const commands = {
        // Home page commands
        hello: () => {
          alert("Hello World!");
        },
        "change the color to *color": (color) => {
          document.body.style.backgroundColor = color.toLowerCase();
        },
        "navigate to *page": (page) => {
          const lowerPage = page.toLowerCase();
          if (lowerPage.includes("home")) window.location.href = "index.html";
          else if (lowerPage.includes("stocks"))
            window.location.href = "stocks.html";
          else if (lowerPage.includes("dogs"))
            window.location.href = "dogs.html";
          else alert("Can't find the page you are looking for.");
        },

        // Stocks page commands
        "lookup *stock": (stock) => {
          const ticker = stock.trim().toUpperCase();
          document.getElementById("stock-name").value = ticker;
          document.getElementById("days").value = "thirty-days";
          document.getElementById("lookup-btn").click();
        },

        // Dogs page commands
        "load dog breed *breed": (breed) => {
          const buttons = document.querySelectorAll(".dog-breed-btn");
          const spoken = breed.trim().toLowerCase();
          let matchFound = false;
          buttons.forEach((button) => {
            const breedName = button.textContent.trim().toLowerCase();
            if (breedName === spoken) {
              button.click();
              matchFound = true;
            }
          });
          if (!matchFound) {
            alert("Can't find the dog breed you are looking for.");
          }
        },
      };

      annyang.addCommands(commands);

      // Turn on audio by default or via button
      document.getElementById("turn-on-btn").addEventListener("click", () => {
        annyang.start();
      });

      // Turn off audio via button
      document.getElementById("turn-off-btn").addEventListener("click", () => {
        annyang.abort();
      });
    } else {
      console.warn("Annyang not supported on this browser.");
    }
  }

  setupVoiceCommands();

  // Dogs page
  // Fetch random dog images and create a slider
  fetch("https://dog.ceo/api/breeds/image/random/20")
    .then((res) => res.json())
    .then((data) => {
      const slideContainer = document.getElementById("carousel-slide");
      slideContainer.innerHTML = "";

      data.message.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        slideContainer.appendChild(img);
      });

      // Initialize the slider after adding images
      simpleslider.getSlider({
        container: slideContainer,
        duration: 1,
        delay: 3,
      });
    })
    .catch((err) => {
      console.error("Failed to load dog images:", err);
    });

  // Fetch dog breeds and create 10 buttons with descriptions
  fetch("https://dogapi.dog/api/v2/breeds")
    .then((res) => res.json())
    .then((data) => {
      const breeds = data.data.slice(0, 10); // Get the first 10 dog breeds
      // Get the container and description box elements from the HTML
      const container = document.getElementById("dog-breed-container");
      const descriptionBox = document.getElementById("dog-breed-description");

      // Hide the dog breed description initially
      descriptionBox.style.display = "none";

      // Loop through the dog breeds and create buttons
      breeds.forEach((breed) => {
        // Create a button for each dog breed
        const btn = document.createElement("button");
        btn.classList.add("dog-breed-btn");
        btn.setAttribute("data-id", breed.id);
        btn.textContent = breed.attributes.name;
        container.appendChild(btn);

        // Add a click event listener to the button
        btn.addEventListener("click", () => {
          const attr = breed.attributes; // Get the attributes of the clicked dog breed

          const currentName =
            document.getElementById("dog-breed-name").textContent;
          const clickedBreedName = `Name: ${attr.name}`;

          // Check if the clicked breed is already visible
          if (
            currentName === clickedBreedName &&
            descriptionBox.style.display === "block"
          ) {
            // If the same dog breed is clicked again, hide the description
            descriptionBox.style.display = "none";
            currentVisibleBreed = null;
          } else {
            // Otherwise, show the description
            document.getElementById("dog-breed-name").textContent =
              clickedBreedName;
            document.getElementById(
              "dog-breed-info"
            ).textContent = `Description: ${
              attr.description || "No description available."
            }`;
            document.getElementById("min-life").textContent = `Min Life: ${
              attr.life?.min || "N/A"
            }`;
            document.getElementById("max-life").textContent = `Max Life: ${
              attr.life?.max || "N/A"
            }`;
            descriptionBox.style.display = "block";
            currentVisibleBreed = attr.name;
          }
        });
      });
    })
    .catch((err) => {
      console.error("Failed to load dog breeds:", err);
    });

  // Home page
  // Fetch a random quote from ZenQuotes API
  fetch("https://zenquotes.io/api/random")
    .then((res) => res.json())
    .then((data) => {
      const quote = data[0].q; // Quote text
      const author = data[0].a; // Author name
      // Get the quote and author elements from the HTML
      const quoteElement = document.getElementById("quote");
      const authorElement = document.getElementById("author");
      quoteElement.textContent = `"${quote}"`; // Set the quote text
      authorElement.textContent = `${author}`; // Set the author name
    })
    .catch((err) => {
      console.error("Failed to load quote:", err);
    });

  // Stocks page
  // Get the form and chart container elements from the HTML
  const stockForm = document.getElementById("stock-form");
  const chartContainer = document.querySelector(".chart-container");

  let stockChart = null;

  // Function to handle the stock data
  stockForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const ticker = document.getElementById("stock-name").value.toUpperCase(); // Get the stock ticker from the input field
    const daysOption = document.getElementById("days").value; // Get the selected time period

    // Validate the selected time period
    let days = 30;
    if (daysOption === "sixty-days") days = 60;
    if (daysOption === "ninety-days") days = 90;

    const today = new Date(); // Get today's date
    const pastDate = new Date(today); // Create a new date object for the past date
    pastDate.setDate(today.getDate() - days); // Calculate the past date based on the selected time period

    // Format the dates
    const formatDate = (date) => date.toISOString().split("T")[0];
    const from = formatDate(pastDate);
    const to = formatDate(today);

    const apiKey = "M5L6bm1IWlrg0V9uGs1wguOLikJO2soz"; // My API key

    // Fetch stock data from Polygon API
    fetch(
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=120&apiKey=${apiKey}`
    )
      .then((res) => res.json())
      .then((data) => {
        // Check to see if there are any results
        if (!data.results || data.results.length === 0) {
          alert("No stock data found. Please try a different ticker.");
          return;
        }

        // Get the labels and closing prices from the data
        const labels = data.results.map((entry) =>
          new Date(entry.t).toLocaleDateString()
        );
        const closingPrices = data.results.map((entry) => entry.c);

        // Remove the previous chart if it exists
        if (stockChart) stockChart.destroy();

        // Show the chart container
        chartContainer.style.display = "block";

        // Get the canvas context and create a new chart
        const ctx = document.getElementById("stock-chart").getContext("2d");

        // Create a line chart using Chart.js
        stockChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: `${ticker} Closing Prices`,
                data: closingPrices,
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
                tension: 0.3,
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: false,
              },
            },
          },
        });
      })
      .catch((err) => {
        console.error("Error fetching stock data:", err);
        alert("Something went wrong. Please check your ticker or try later.");
      });
  });

  // Fetch the top 5 stocks from Reddit API and create a table
  fetch("https://tradestie.com/api/v1/apps/reddit?date=2022-04-03")
    .then((res) => res.json())
    .then((stocks) => {
      const top5 = stocks.slice(0, 5); // Get the top 5 stocks
      const tbody = document.getElementById("stocks-list"); // Get the table body element
      tbody.innerHTML = ""; // Clear the table body

      // Create table rows for each stock
      top5.forEach((stock) => {
        const tr = document.createElement("tr");

        // Ticker linking to its Yahoo Finance equivalent
        const tickerTd = document.createElement("td"); // Create a table cell for the ticker
        const link = document.createElement("a"); // Create a link element
        // Set the link attributes
        link.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
        link.textContent = stock.ticker;
        link.target = "_blank";
        tickerTd.appendChild(link);
        link.style.textDecoration = "none";

        // Comment count
        const commentsTd = document.createElement("td"); // Create a table cell for the comment count
        commentsTd.textContent = stock.no_of_comments; // Set the comment count

        // Sentiment (Bullish/Bearish)
        const sentimentTd = document.createElement("td"); // Create a table cell for the sentiment
        const img = document.createElement("img"); // Create an image element
        // Set the image source and alt text based on sentiment
        if (stock.sentiment === "Bullish") {
          img.src = "icons/bullish.svg";
          img.alt = "Bullish";
          img.id = "bullish";
        } else if (stock.sentiment === "Bearish") {
          img.src = "icons/bearish.svg";
          img.alt = "Bearish";
          img.id = "bearish";
        }
        img.style.width = "5rem";
        sentimentTd.appendChild(img);

        // Add cells to row
        tr.appendChild(tickerTd);
        tr.appendChild(commentsTd);
        tr.appendChild(sentimentTd);
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Failed to load Reddit stocks:", err);
    });
}

// Call the initializePage function when the window loads
window.onload = initializePage;
