const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbz2f3cZh5hqwqvIt3QcYtE9CycoBpC9AiBv3h3CfHPkZm3UhLGfrwIbEecDW5axluGu/exec";

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("schedule-body");
  const totalSubjectsEl = document.getElementById("total-subjects");

  // បង្ហាញសារ Loading កំឡុងពេលទាញទិន្នន័យ
  tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">កំពុងទាញយកទិន្នន័យពី Google Sheets...</td></tr>`;

  // ទាញទិន្នន័យពី Google Sheets API
  fetch(GOOGLE_SHEET_API_URL, { redirect: "follow" })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(schedules => {
      // លុបទិន្នន័យចាស់ក្នុងតារាង
      tableBody.innerHTML = "";

      if (!schedules || schedules.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">មិនមានទិន្នន័យកាលវិភាគឡើយ</td></tr>`;
        totalSubjectsEl.textContent = "0";
        return;
      }

      // ចាក់ទិន្នន័យថ្មីចូលក្នុងតារាង HTML
      schedules.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><strong>${item.day || ''}</strong></td>
          <td>${item.time || ''}</td>
          <td>${item.subject || ''}</td>
          <td>${item.room || ''}</td>
          <td>${item.instructor || ''}</td>
        `;
        tableBody.appendChild(row);
      });

      // បង្ហាញចំនួនមុខវិជ្ជាសរុប
      totalSubjectsEl.textContent = schedules.length;
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">មានបញ្ហាក្នុងការទាញយកទិន្នន័យ! សូមពិនិត្យមើលការកំណត់ក្នុង Google Sheet/Apps Script។</td></tr>`;
    });
});