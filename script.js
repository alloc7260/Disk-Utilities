// Note: Web browsers don't have direct access to file system information due to security restrictions
// This is a simulated version that will show sample data
// For real disk usage, you'd need to use an Electron app, a backend server, or the experimental File System Access API

// New function to fetch disk data from the current system
function fetchDiskData() {
  return new Promise((resolve, reject) => {
    if (typeof require !== "undefined") {
      // Using Node.js integration (e.g., in Electron)
      const { exec } = require("child_process");
      exec(
        "wmic logicaldisk get DeviceID,FreeSpace,Size /format:csv",
        (error, stdout, stderr) => {
          if (error) {
            return reject(error);
          }
          const lines = stdout.trim().split("\n");
          const diskData = [];
          // Skip header line and any empty lines
          lines.forEach((line, index) => {
            if (index === 0) return; // header
            const parts = line.split(",");
            if (parts.length >= 4) {
              const device = parts[1].trim();
              const free = parseInt(parts[2], 10);
              const total = parseInt(parts[3], 10);
              if (!isNaN(free) && !isNaN(total) && total > 0) {
                const used = total - free;
                diskData.push({
                  device: device,
                  mountpoint: device + "\\",
                  total: total / 1024 ** 3, // bytes to GB
                  used: used / 1024 ** 3,
                  free: free / 1024 ** 3,
                  percent: Math.round((used / total) * 100),
                });
              }
            }
          });
          resolve(diskData);
        }
      );
    } else {
      // Fallback simulated data for browsers without Node integration
      resolve([
        {
          device: "C:",
          mountpoint: "C:\\",
          total: 500,
          used: 350,
          free: 150,
          percent: 70,
        },
        {
          device: "D:",
          mountpoint: "D:\\",
          total: 1000,
          used: 600,
          free: 400,
          percent: 60,
        },
        {
          device: "E:",
          mountpoint: "E:\\",
          total: 2000,
          used: 1200,
          free: 800,
          percent: 60,
        },
      ]);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  fetchDiskData()
    .then((diskData) => {
      // Display partition information
      displayPartitionInfo(diskData);

      // Calculate and display totals
      calculateAndDisplayTotals(diskData);

      // Create the pie chart for total disk usage
      createPieChart(diskData);

      // Create the bar chart for disk usage by partition
      createBarChart(diskData);
    })
    .catch((err) => {
      console.error("Error fetching disk data:", err);
    });
});

function displayPartitionInfo(partitionInfo) {
  const container = document.getElementById("partitions-info");

  partitionInfo.forEach((partition) => {
    const card = document.createElement("div");
    card.className = "partition-card";

    card.innerHTML = `
            <h4>${partition.device}</h4>
            <p>Mountpoint: ${partition.mountpoint}</p>
            <p>Total: ${partition.total.toFixed(2)} GB</p>
            <p>Used: ${partition.used.toFixed(2)} GB</p>
            <p>Free: ${partition.free.toFixed(2)} GB</p>
            <p>Usage: ${partition.percent}%</p>
            <div class="partition-usage">
                <div class="usage-fill" style="width: ${
                  partition.percent
                }%"></div>
            </div>
        `;

    container.appendChild(card);
  });
}

function calculateAndDisplayTotals(partitionInfo) {
  const totalUsed = partitionInfo.reduce(
    (sum, partition) => sum + partition.used,
    0
  );
  const totalFree = partitionInfo.reduce(
    (sum, partition) => sum + partition.free,
    0
  );

  document.getElementById(
    "total-used"
  ).textContent = `Total Used Space: ${totalUsed.toFixed(2)} GB`;
  document.getElementById(
    "total-free"
  ).textContent = `Total Free Space: ${totalFree.toFixed(2)} GB`;

  return { totalUsed, totalFree };
}

function createPieChart(partitionInfo) {
  const { totalUsed, totalFree } = calculateAndDisplayTotals(partitionInfo);
  const ctx = document.getElementById("pieChart").getContext("2d");

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: [
        `Total Used Space (${totalUsed.toFixed(2)} GB)`,
        `Total Free Space (${totalFree.toFixed(2)} GB)`,
      ],
      datasets: [
        {
          data: [totalUsed, totalFree],
          backgroundColor: ["#ff9999", "#66b3ff"],
          borderColor: ["#ff8888", "#55a2ff"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: `Total Disk Space: ${(totalUsed + totalFree).toFixed(2)} GB`,
        },
      },
    },
  });
}

function createBarChart(partitionInfo) {
  const ctx = document.getElementById("barChart").getContext("2d");

  const devices = partitionInfo.map((p) => p.device);
  const usedSpaces = partitionInfo.map((p) => p.used);
  const freeSpaces = partitionInfo.map((p) => p.free);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: devices,
      datasets: [
        {
          label: "Used Space (GB)",
          data: usedSpaces,
          backgroundColor: "#ff9999",
          borderColor: "#ff8888",
          borderWidth: 1,
        },
        {
          label: "Free Space (GB)",
          data: freeSpaces,
          backgroundColor: "#66b3ff",
          borderColor: "#55a2ff",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: false,
          title: {
            display: true,
            text: "Disk Partitions",
          },
        },
        y: {
          stacked: false,
          title: {
            display: true,
            text: "Space (GB)",
          },
        },
      },
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: "Disk Usage by Partition",
        },
      },
    },
  });
}
