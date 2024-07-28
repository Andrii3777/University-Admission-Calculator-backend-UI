/**
 * Fetches the student's scores from the server and populates the form fields with the retrieved data.
 * @returns {Promise<void>}
 */
async function fetchStudentScores() {
  try {
    // Make a GET request to fetch student scores.
    const response = await fetch('/api/v1/getStudentScores', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch student scores.');
    }

    const { scores } = await response.json();

    // Populate the form fields with the retrieved scores.
    document.getElementById('mathematics').value = scores.Mathematics ?? '';
    document.getElementById('physics').value = scores.Physics ?? '';
    document.getElementById('chemistry').value = scores.Chemistry ?? '';
    document.getElementById('biology').value = scores.Biology ?? '';
  } catch (error) {
    console.error('Error fetching student scores:', error.message);
  }
}

/**
 * Generates an HTML table from the provided specialties and type.
 * @param {Array} specialties - An array of specialty objects.
 * @param {string} type - The type of specialties ('paid' or 'free').
 * @returns {string} - The generated HTML table as a string.
 */
function generateTable(specialties, type) {
  let headers = '';

  if (type === 'paid') {
    headers = '<th>Tuition Cost</th>';
  }

  // Construct the HTML table with specialties.
  return `
      <table class="results-table">
        <thead>
          <tr>
            <th>Specialty</th>
            <th>Minimum required Score</th>
            <th>Your total Score</th>
            ${headers}
          </tr>
        </thead>
        <tbody>
          ${specialties.map(specialty => {
    let tuitionCost = '';
    if (type === 'paid') {
      tuitionCost = `<td>$${specialty.tuitionCost}</td>`;
    }
    return `
              <tr>
                <td>${specialty.name}</td>
                <td>${specialty.requiredScore}</td>
                <td>${specialty.calculationDetails} = <b>${specialty.totalScore}</b></td>
                ${tuitionCost}
              </tr>
            `;
  }).join('')}
        </tbody>
      </table>
    `;
}

/**
 * Handles the enrollment form submission, sends the scores to the server, and updates the results display.
 * @returns {Promise<void>}
 */
async function enroll() {
  const form = document.getElementById('enrollmentForm');
  const formData = new FormData(form);
  const scores = {};

  formData.forEach((value, key) => {
    scores[key] = value;
  });

  // Send the scores to the server via POST request.
  const response = await fetch('/api/v1/enroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scores })
  });

  const result = await response.json();
  const scoreError = document.querySelector('.score.error');
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  scoreError.textContent = '';

  // Handle the server response based on the result type.
  if (result.error) {
    scoreError.textContent = result.error;
  } else {
    let tableHTML = '';
    if (result.type === 'free') {
      tableHTML = generateTable(result.specialties, 'free');
      resultsDiv.innerHTML = `<h3>Free Enrollment Specialties</h3>${tableHTML}`;
    } else if (result.type === 'paid') {
      tableHTML = generateTable(result.specialties, 'paid');
      resultsDiv.innerHTML = `<h3>Paid Enrollment Specialties</h3>${tableHTML}`;
    } else if (result.type === 'none') {
      resultsDiv.innerHTML = '<h3>No specialties available for the provided scores.</h3>';
    } else {
      location.assign('/api/v1/calculator/');
    }
  }
}

document.addEventListener('DOMContentLoaded', fetchStudentScores);