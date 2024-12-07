document.addEventListener("DOMContentLoaded", () => {
    const albumList = document.getElementById("album-list");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const addAlbumForm = document.getElementById("add-album-form");
  
    // Fetch and display all albums initially
    fetch("http://localhost:8080/albums")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch albums");
        }
        return response.json();
      })
      .then((albums) => {
        displayAlbums(albums);
      })
      .catch((error) => {
        console.error("Error fetching albums:", error);
        albumList.innerHTML = "<p>Failed to load albums. Please try again later.</p>";
      });
  
    // Search album by ID
    searchButton.addEventListener("click", () => {
      const id = searchInput.value.trim();
  
      if (!id) {
        alert("Please enter a valid album ID.");
        return;
      }
  
      fetch(`http://localhost:8080/albums/${id}`)
        .then((response) => {
          if (response.status === 404) {
            throw new Error("Album not found");
          }
          if (!response.ok) {
            throw new Error("Failed to fetch album");
          }
          return response.json();
        })
        .then((album) => {
          displayAlbums([album]);
        })
        .catch((error) => {
          console.error("Error:", error);
          albumList.innerHTML = "<p>Album not found. Please try another ID.</p>";
        });
    });
  
    // Add new album
    addAlbumForm.addEventListener("submit", (event) => {
      event.preventDefault();
  
      const title = document.getElementById("album-title").value.trim();
      const artist = document.getElementById("album-artist").value.trim();
      const price = parseFloat(document.getElementById("album-price").value);
  
      if (!title || !artist || isNaN(price)) {
        alert("Please fill all fields correctly.");
        return;
      }
  
      const newAlbum = { title, artist, price };
  
      fetch("http://localhost:8080/albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAlbum),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to add album");
          }
          return response.json();
        })
        .then(() => {
          alert("Album added successfully!");
          addAlbumForm.reset();
  
          // Refresh album list
          return fetch("http://localhost:8080/albums");
        })
        .then((response) => response.json())
        .then((albums) => {
          displayAlbums(albums);
        })
        .catch((error) => {
          console.error("Error adding album:", error);
          alert("Failed to add album. Please try again.");
        });
    });
  
    // Function to display albums
    function displayAlbums(albums) {
      albumList.innerHTML = ""; // Clear existing content
      albums.forEach((album) => {
        const albumCard = document.createElement("div");
        albumCard.classList.add("album-card");
  
        albumCard.innerHTML = `
          <h3>${album.title}</h3>
          <p><strong>Artist:</strong> ${album.artist}</p>
          <p><strong>Price:</strong> $${album.price.toFixed(2)}</p>
        `;
  
        albumList.appendChild(albumCard);
      });
    }
  });
  