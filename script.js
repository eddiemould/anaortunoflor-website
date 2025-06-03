document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("a");
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const mainContent = document.getElementById("mainContent");

  // Initially hide the content (set opacity to 0)
  mainContent.style.opacity = 0;

  // Get the top-level folder from the path (e.g. "projects" from "#/projects/project-a.html")
  function getSectionFromPath(path) {
    // Special case: treat "#/" (home) as "projects"
    if (path === "#/" || path === "" || path === "#") {
      return "projects";
    }
    return path.replace(/^#\/|\/index\.html$/g, "").split("/")[0] || "";
  }

  function highlightActiveLink() {
    const currentSection = getSectionFromPath(window.location.hash);

    document.querySelectorAll('.sidebar a').forEach(a => {
      const href = a.getAttribute("href");
      const linkSection = getSectionFromPath(href);
      const isActive = linkSection === currentSection;
      a.classList.toggle("active-link", isActive);
    });
  }

  function loadPageFromHash() {
    const hash = window.location.hash || "#/";
    const path = hash.slice(1); // remove '#'

    highlightActiveLink();

    // Fade out content before loading new
    mainContent.style.opacity = 0;

    // Decide which file to load
    const targetPath = (path === "" || path === "/") ? "index.html" : path;

    fetch("./" + targetPath)
      .then(res => {
        if (!res.ok) throw new Error("Page not found");
        return res.text();
      })
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        const content = doc.querySelector("main") || doc.body;
        mainContent.innerHTML = content.innerHTML;

        const pageTitle = doc.querySelector("title")?.textContent || "Untitled Page";
        document.title = pageTitle;

        highlightActiveLink(); // Re-run in case of internal nav
        mainContent.style.opacity = 1;
      })
      .catch(() => {
        mainContent.innerHTML = "<h2>404</h2><p>Page not found.</p>";
        document.title = "Page Not Found";
        mainContent.style.opacity = 1;
      });

    // Close sidebar on mobile after page load
    if (sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      mainContent.classList.remove("hidden");
    }
  }

  // Handle in-app navigation with hashes
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        window.location.hash = href;
      }
    });
  });

  // Toggle sidebar on mobile
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("hidden", sidebar.classList.contains("open"));
  });

  // Listen for back/forward navigation
  window.addEventListener("hashchange", loadPageFromHash);

  // Initial load
  loadPageFromHash();

    // Set current year in copyright
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
});
