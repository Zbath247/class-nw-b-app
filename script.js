const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbz2f3cZh5hqwqvIt3QcYtE9CycoBpC9AiBv3h3CfHPkZm3UhLGfrwIbEecDW5axluGu/exec";

// បញ្ជីឈ្មោះសិស្សថ្នាក់ G1-NW-B (៤៧ នាក់)
const studentList = [
  { id: 1, student_id: "DUC2024-0021", name_kh: "ក្លាន ផែន", name_en: "KLAN PHAEN", gender: "ស្រី", dob: "៥ កញ្ញា ២០០៤" },
  { id: 2, student_id: "DUC2024-0023", name_kh: "ក្លាន ឡូត", name_en: "KLAN LOUT", gender: "ប្រុស", dob: "២ តុលា ២០០១" },
  { id: 3, student_id: "DUC2024-0024", name_kh: "ក្លាន ស្នាក", name_en: "KLAN SNAK", gender: "ប្រុស", dob: "១០ កញ្ញា ២០០៦" },
  { id: 4, student_id: "DUC2024-0033", name_kh: "ខុយ ស្រីនី", name_en: "KHOUY SREYNY", gender: "ស្រី", dob: "១៤ សីហា ២០០២" },
  { id: 5, student_id: "DUC2024-0036", name_kh: "ខេង តាំងលី", name_en: "KHENG TANGLY", gender: "ស្រី", dob: "១០ វិច្ឆិកា ២០០៣" },
  { id: 6, student_id: "DUC2024-0047", name_kh: "គង់ សិតា", name_en: "KONG SEAT", gender: "ប្រុស", dob: "៧ ធ្នូ ២០០៤" },
  { id: 7, student_id: "DUC2024-0056", name_kh: "គឹម ស្រីពៅ", name_en: "KIM SREYPOV", gender: "ស្រី", dob: "៣ មិថុនា ២០០១" },
  { id: 8, student_id: "DUC2024-0079", name_kh: "ឃុន សេងលៀប", name_en: "KHOUN SENGLEAB", gender: "ប្រុស", dob: "១៧ មករា ២០០៦" },
  { id: 9, student_id: "DUC2024-0086", name_kh: "ចង់ ធុង", name_en: "CHONG THONG", gender: "ប្រុស", dob: "១៧ សីហា ២០០៣" },
  { id: 10, student_id: "DUC2024-0092", name_kh: "ចាន់ ឆៃយ៉ា", name_en: "CHAN CHHAIYA", gender: "ប្រុស", dob: "១១ វិច្ឆិកា ២០០៥" },
  { id: 11, student_id: "DUC2024-0099", name_kh: "ចាន់ សើន", name_en: "CHANN SEUN", gender: "ប្រុស", dob: "១១ កក្កដា ២០០៣" },
  { id: 12, student_id: "DUC2024-0144", name_kh: "ឈួន សុខលៀង", name_en: "CHHUON SOKLEANG", gender: "ស្រី", dob: "៩ មីនា ២០០៥" },
  { id: 13, student_id: "DUC2024-0185", name_kh: "ឌុច តុលាហៀន", name_en: "DUCH TONGHEAN", gender: "ប្រុស", dob: "១ វិច្ឆិកា ២០០៣" },
  { id: 14, student_id: "DUC2024-0197", name_kh: "ណុប ចាម", name_en: "NOB CHAM", gender: "ប្រុស", dob: "២២ កុម្ភៈ ២០០៤" },
  { id: 15, student_id: "DUC2024-0211", name_kh: "តី វៃ", name_en: "TEY VAI", gender: "ប្រុស", dob: "៤ មេសា ២០០៥" },
  { id: 16, student_id: "DUC2024-0213", name_kh: "តឿន ស្រីនាង", name_en: "TOEUN SREYNEANG", gender: "ស្រី", dob: "៣ កញ្ញា ២០០៤" },
  { id: 17, student_id: "DUC2024-0272", name_kh: "នាង រ៉ាវី", name_en: "NEANG RAVY", gender: "ប្រុស", dob: "១៥ មីនា ២០០៦" },
  { id: 18, student_id: "DUC2024-0273", name_kh: "នាង សំរិទ្ធិ", name_en: "NEANG SOMRITH", gender: "ប្រុស", dob: "១៤ ធ្នូ ២០០៤" },
  { id: 19, student_id: "DUC2024-0305", name_kh: "ប៉ាត ឈាងអ៊ី", name_en: "PAT CHEANGEI", gender: "ស្រី", dob: "១ មករា ២០០៥" },
  { id: 20, student_id: "DUC2024-0331", name_kh: "ប៉ៃ វុទ្ធារដ្ឋា", name_en: "PAI VUTHAROTHA", gender: "ប្រុស", dob: "៥ តុលា ២០០៣" },
  { id: 21, student_id: "DUC2024-0368", name_kh: "ផ្លយ រើត", name_en: "PHLORY RET", gender: "ស្រី", dob: "១៧ មករា ២០០៤" },
  { id: 22, student_id: "DUC2024-0376", name_kh: "ពៅ ភិន", name_en: "POV PIN", gender: "ប្រុស", dob: "៩ មីនា ២០០៤" },
  { id: 23, student_id: "DUC2024-0414", name_kh: "មិ សាវៀន", name_en: "MI SAVIEN", gender: "ប្រុស", dob: "២ ឧសភា ២០០២" },
  { id: 24, student_id: "DUC2024-0417", name_kh: "ម៉ុក សម្បត្តិ", name_en: "MOK SAMBATH", gender: "ប្រុស", dob: "១ ធ្នូ ២០០០" },
  { id: 25, student_id: "DUC2024-0425", name_kh: "មៀច ស្រីមុំ", name_en: "MIECH SREY MOM", gender: "ស្រី", dob: "២៥ សីហា ២០០៤" },
  { id: 26, student_id: "DUC2024-0439", name_kh: "ម៉ៅ ស្រីឃៀម", name_en: "MAO SREYKHIEM", gender: "ស្រី", dob: "២០ មីនា ២០០២" },
  { id: 27, student_id: "DUC2024-0457", name_kh: "យ៉ុន ទូច", name_en: "YON TOUCH", gender: "ស្រី", dob: "១៥ កញ្ញា ២០០៣" },
  { id: 28, student_id: "DUC2024-0474", name_kh: "យ៉ែម ដេវិត", name_en: "YEM DEVIT", gender: "ប្រុស", dob: "២២ មេសា ២០០៦" },
  { id: 29, student_id: "DUC2024-0476", name_kh: "យ៉ែម ស៊ីនួន", name_en: "YEM SINOUN", gender: "ស្រី", dob: "២៥ ធ្នូ ២០០៥" },
  { id: 30, student_id: "DUC2024-0479", name_kh: "រជុំ បរវែន", name_en: "ROCHOM BORVAEN", gender: "ប្រុស", dob: "១០ វិច្ឆិកា ២០០២" },
  { id: 31, student_id: "DUC2024-0487", name_kh: "រមាស ខឿន", name_en: "ROMAS KHOEUN", gender: "ប្រុស", dob: "១៣ កុម្ភៈ ២០០៣" },
  { id: 32, student_id: "DUC2024-0495", name_kh: "រ៉ាត់ រូន", name_en: "RAT ROUN", gender: "ប្រុស", dob: "២ មករា ២០០១" },
  { id: 33, student_id: "DUC2024-0519", name_kh: "រឿន លីម៉ា", name_en: "ROEUN LIMA", gender: "ប្រុស", dob: "២៣ មេសា ២០០៦" },
  { id: 34, student_id: "DUC2024-0588", name_kh: "វែ ធន", name_en: "VE THON", gender: "ប្រុស", dob: "១៤ កក្កដា ២០០២" },
  { id: 35, student_id: "DUC2024-0632", name_kh: "សល់ លិច", name_en: "SOL LICH", gender: "ប្រុស", dob: "២ មករា ២០០៣" },
  { id: 36, student_id: "DUC2024-0659", name_kh: "សារឿន សេរីវឌ្ឍន៍", name_en: "SAROEUN SEREYVATH", gender: "ប្រុស", dob: "១៧ កក្កដា ២០០៤" },
  { id: 37, student_id: "DUC2024-0662", name_kh: "ស៊ិន ចាន់ថ្លា", name_en: "SIN CHANTHLA", gender: "ប្រុស", dob: "៣ មករា ២០០៤" },
  { id: 38, student_id: "DUC2024-0730", name_kh: "សេវ ឆវ៉ាត់", name_en: "SEV CHHVATH", gender: "ប្រុស", dob: "១ មករា ២០០២" },
  { id: 39, student_id: "DUC2024-0744", name_kh: "សៃ វឌ្ឍនា", name_en: "SAIY VATTHANA", gender: "ប្រុស", dob: "១៥ វិច្ឆិកា ២០០៥" },
  { id: 40, student_id: "DUC2024-0745", name_kh: "សៃ ស្រីតូច", name_en: "SAI SREYTOUCH", gender: "ស្រី", dob: "១០ តុលា ២០០២" },
  { id: 41, student_id: "DUC2024-0765", name_kh: "ហាំ ផល", name_en: "HAM PHOL", gender: "ប្រុស", dob: "១២ ឧសភា ២០០២" },
  { id: 42, student_id: "DUC2024-0789", name_kh: "ហួត ធានិន", name_en: "HUOT THEANIN", gender: "ប្រុស", dob: "៣០ វិច្ឆិកា ២០០៣" },
  { id: 43, student_id: "DUC2024-0802", name_kh: "ហ៊ាន សុខពិសិដ្ឋ", name_en: "HEAN SOKPISEY", gender: "ស្រី", dob: "២៤ មីនា ២០០៦" },
  { id: 44, student_id: "DUC2024-0803", name_kh: "ហៀម កាមុត", name_en: "HIEM KAMOUT", gender: "ប្រុស", dob: "៣ មីនា ២០០៥" },
  { id: 45, student_id: "DUC2024-0807", name_kh: "ហេង ស៊ីវម៉េង", name_en: "HENG SIVMENG", gender: "ប្រុស", dob: "២៦ មេសា ២០០៥" },
  { id: 46, student_id: "DUC2024-0849", name_kh: "អ៊ុក ថាវ", name_en: "OUK THAV", gender: "ប្រុស", dob: "១ មករា ២០០៣" },
  { id: 47, student_id: "DUC2024-0853", name_kh: "អ៊ន តួហៀ", name_en: "ON TUOHIE", gender: "ប្រុស", dob: "១០ មីនា ២០០២" }
];

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  fetchSchedule();
  renderStudents(studentList);
  setupSearch();
});

function setupNavigation() {
  const links = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page-content');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));

      link.classList.add('active');
      const target = link.id.replace('menu-', 'section-');
      document.getElementById(target).classList.add('active');
    });
  });
}

function fetchSchedule() {
  const tbody = document.getElementById("schedule-body");
  const totalSubj = document.getElementById("total-subjects");

  const daysMap = { 0: "អាទិត្យ", 1: "ច័ន្ទ", 2: "អង្គារ", 3: "ពុធ", 4: "ព្រហស្បតិ៍", 5: "សុក្រ", 6: "សៅរ៍" };
  const todayKhmer = daysMap[new Date().getDay()];

  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">កំពុងភ្ជាប់ទៅកាន់ប្រព័ន្ធ Google Sheets...</td></tr>`;

  fetch(GOOGLE_SHEET_API_URL, { redirect: "follow" })
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = "";
      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">ពុំមានទិន្នន័យកាលវិភាគឡើយ</td></tr>`;
        totalSubj.textContent = "0";
        return;
      }

      data.forEach(item => {
        const tr = document.createElement("tr");
        if (item.day && item.day.trim() === todayKhmer) {
          tr.classList.add("today-highlight");
        }

        tr.innerHTML = `
          <td><strong>${item.day || ''}</strong></td>
          <td>${item.time || ''}</td>
          <td>${item.subject || ''}</td>
          <td><span class="room-badge">${item.room || ''}</span></td>
          <td>${item.instructor || ''}</td>
        `;
        tbody.appendChild(tr);
      });

      totalSubj.textContent = data.length;
    })
    .catch(err => {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#f87171;">ការភ្ជាប់បានបរាជ័យ!</td></tr>`;
    });
}

function renderStudents(data) {
  const tbody = document.getElementById("student-body");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">រកមិនឃើញទិន្នន័យដែលស្វែងរកឡើយ</td></tr>`;
    return;
  }

  data.forEach(s => {
    const tr = document.createElement("tr");
    const genderClass = s.gender === "ស្រី" ? "female" : "male";

    tr.innerHTML = `
      <td>${s.id}</td>
      <td><strong style="color: var(--accent-cyan);">${s.student_id}</strong></td>
      <td>${s.name_kh}</td>
      <td>${s.name_en}</td>
      <td><span class="gender-badge ${genderClass}">${s.gender}</span></td>
      <td>${s.dob}</td>
    `;
    tbody.appendChild(tr);
  });
}

function setupSearch() {
  const input = document.getElementById("student-search");
  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = studentList.filter(s =>
      s.name_kh.toLowerCase().includes(query) ||
      s.name_en.toLowerCase().includes(query) ||
      s.student_id.toLowerCase().includes(query)
    );
    renderStudents(filtered);
  });
}
