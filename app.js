// មុខងារបើក Modal បه្ឆែមនិស្សិតថ្មី
function openAddStudentModal() {
  const modal = document.getElementById("addStudentModal");
  if (modal) modal.classList.remove("hidden");
}

// មុខងារបិទ Modal បន្ថែមនិស្សិត
function closeAddStudentModal() {
  const modal = document.getElementById("addStudentModal");
  if (modal) modal.classList.add("hidden");
  const form = document.getElementById("addStudentForm");
  if (form) form.reset();
}

// មុខងារបញ្ជូនទិន្នន័យបន្ថែមនិស្សិតថ្មីទៅកាន់ Server (API)
async function handleAddStudent(e) {
  e.preventDefault();
  
  const studentId = document.getElementById("newStudentId")?.value.trim();
  const khmerName = document.getElementById("newKhmerName")?.value.trim();
  const latinName = document.getElementById("newLatinName")?.value.trim();
  const gender = document.getElementById("newGender")?.value.trim();
  const dob = document.getElementById("newDob")?.value.trim();

  if (!studentId || !khmerName) {
    alert("សូមបំពេញអត្តលេខ និងឈ្មោះខ្មែរឱ្យបានត្រឹមត្រូវ!");
    return;
  }

  const submitBtn = document.getElementById("saveStudentBtn");
  setButtonLoading(submitBtn, true, "កំពុងរក្សាទុក...");

  try {
    const payload = {
      action: "addStudent",
      student_id: studentId,
      khmer_name: khmerName,
      latin_name: latinName,
      gender: gender,
      dob: dob
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data?.status === "success" || data === true) {
      alert("បន្ថែមទិន្នន័យនិស្សិតថ្មីជោគជ័យ!");
      closeAddStudentModal();
      fetchStudents(); // ទាញយកតារាងនិស្សិតមកបង្ហាញសាថ្មី
    } else {
      alert(data?.message || "មានបញ្ហាក្នុងការបន្ថែមទិន្នន័យនិស្សិត!");
    }
  } catch (err) {
    console.error("Add Student Error:", err);
    alert("មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server!");
  } finally {
    setButtonLoading(submitBtn, false, "រក្សាទុក", "save");
  }
}
