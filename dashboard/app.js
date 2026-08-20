const API_URL = "http://localhost:3000";


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

  try {

    const response =
      await fetch(
        `${API_URL}/api/dashboard`
      );

    const result =
      await response.json();


    if (!result.success) {
      throw new Error(
        "Dashboard API failed"
      );
    }


    const data =
      result.data;


    // SUMMARY CARDS

    document.getElementById(
      "totalCompanies"
    ).textContent =
      data.totalCompanies;


    document.getElementById(
      "totalDevices"
    ).textContent =
      data.totalDevices;


    document.getElementById(
      "activeDevices"
    ).textContent =
      data.activeDevices;


    document.getElementById(
      "inactiveDevices"
    ).textContent =
      data.inactiveDevices;


    // LATEST RUN

    if (data.latestRun) {

      const run =
        data.latestRun;


      document.getElementById(
        "runId"
      ).textContent =
        `#${run.id}`;


      document.getElementById(
        "runAccounts"
      ).textContent =
        run.total_accounts;


      document.getElementById(
        "runSuccess"
      ).textContent =
        run.success_count;


      document.getElementById(
        "runFailed"
      ).textContent =
        run.failed_count;


      document.getElementById(
        "runStatus"
      ).textContent =
        run.status;


      const completedDate =
        new Date(
          run.finished_at
        );


      document.getElementById(
        "runCompleted"
      ).textContent =
        completedDate.toLocaleString();

    }

  } catch (error) {

    console.error(
      "Dashboard Error:",
      error
    );

  }

}


// ==========================================
// LOAD COMPANIES
// ==========================================

async function loadCompanies() {

  const table =
    document.getElementById(
      "companyTable"
    );


  try {

    table.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="loading"
        >
          Loading companies...
        </td>
      </tr>
    `;


    const response =
      await fetch(
        `${API_URL}/api/companies`
      );


    const result =
      await response.json();


    if (!result.success) {
      throw new Error(
        "Company API failed"
      );
    }


    table.innerHTML = "";


    result.data.forEach(company => {

      const row =
        document.createElement("tr");


      row.innerHTML = `
        <td class="company-name">
          ${company.customer_name}
        </td>

        <td>
          ${company.total_devices}
        </td>

        <td>
          <span class="active-badge">
            ${company.active_devices} Active
          </span>
        </td>

        <td>
          <span class="inactive-badge">
            ${company.inactive_devices} Inactive
          </span>
        </td>

         <td>
  <div class="company-actions-cell">

    <button
      class="view-button"
      data-id="${company.account_id}"
      data-name="${company.customer_name}"
    >
      View Devices
    </button>

    <button
      class="edit-company-button"
      data-id="${company.account_id}"
      data-name="${company.customer_name}"
      data-username="${company.username || ""}"
    >
      Edit
    </button>

  </div>
</td>
      `;


      table.appendChild(row);

    });


    // VIEW DEVICE BUTTONS

    document
      .querySelectorAll(
        ".view-button"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            openDeviceModal(
              button.dataset.id,
              button.dataset.name
            );

          }
        );

      });

  } catch (error) {

    console.error(
      "Company Error:",
      error
    );


    table.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="loading"
        >
          Failed to load companies
        </td>
      </tr>
    `;

  }

}

 // ==========================================
// EDIT COMPANY BUTTONS
// ==========================================

document
  .querySelectorAll(".edit-company-button")
  .forEach(button => {

    button.addEventListener("click", () => {

      const accountId =
        button.dataset.id;

      const companyName =
        button.dataset.name;

      const username =
        button.dataset.username || "";


      console.log(
        "Edit company clicked:",
        accountId,
        companyName
      );


      const editModal =
        document.getElementById(
          "editCompanyModal"
        );


      editModal.dataset.accountId =
        accountId;


      document.getElementById(
        "editCompanyName"
      ).value =
        companyName;


      document.getElementById(
        "editCompanyUsername"
      ).value =
        username;


      document.getElementById(
        "editCompanyPassword"
      ).value =
        "";


      document.getElementById(
        "editCompanyMessage"
      ).textContent =
        "";


      editModal.classList.add("show");

    });

  });

// ==========================================
// DEVICE MODAL
// ==========================================

async function openDeviceModal(
  accountId,
  companyName
) {

  const modal =
    document.getElementById(
      "deviceModal"
    );


  const deviceList =
    document.getElementById(
      "deviceList"
    );


  document.getElementById(
    "modalCompanyName"
  ).textContent =
    companyName;


  deviceList.innerHTML =
    "Loading devices...";


  modal.classList.add(
    "show"
  );


  try {

    const response =
      await fetch(
        `${API_URL}/api/companies/${accountId}/devices`
      );


    const result =
      await response.json();


    deviceList.innerHTML =
      "";


    document.getElementById(
      "modalDeviceCount"
    ).textContent =
      `${result.totalDevices} Device(s)`;


    result.data.forEach(device => {

      const isActive =
        device.current_status ===
        "Active";


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "device-card";


      card.innerHTML = `

        <div>

          <div class="device-name">

            ${device.device_label}

          </div>


          <div class="device-info">

            Flow:
            ${device.current_flow}

            <br>

            Total:
            ${device.current_total}

            <br>

            Last Checked:
            ${new Date(
              device.last_checked
            ).toLocaleString()}

          </div>

        </div>


        <div
          class="
            device-status
            ${
              isActive
                ? "device-active"
                : "device-inactive"
            }
          "
        >

          ${device.current_status}

        </div>

      `;


      deviceList.appendChild(
        card
      );

    });

  } catch (error) {

    console.error(
      "Device Error:",
      error
    );


    deviceList.innerHTML =
      "Failed to load devices.";

  }

}


// ==========================================
// CLOSE MODAL
// ==========================================

document
  .getElementById(
    "closeModal"
  )
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "deviceModal"
        )
        .classList
        .remove("show");

    }
  );


// ==========================================
// REFRESH BUTTON
// ==========================================

document
  .getElementById(
    "refreshButton"
  )
  .addEventListener(
    "click",
    async () => {

      await loadDashboard();

      await loadCompanies();

    }
  );


// ==========================================
// INITIAL LOAD
// ==========================================

loadDashboard();

loadCompanies();


// ==========================================
// ADD COMPANY MODAL
// ==========================================

const addCompanyButton =
  document.getElementById("addCompanyButton");

const addCompanyModal =
  document.getElementById("addCompanyModal");

const closeAddCompanyModal =
  document.getElementById("closeAddCompanyModal");

const cancelAddCompany =
  document.getElementById("cancelAddCompany");


// OPEN MODAL

addCompanyButton.addEventListener("click", () => {

  addCompanyModal.classList.add("show");

});


// CLOSE MODAL

closeAddCompanyModal.addEventListener("click", () => {

  addCompanyModal.classList.remove("show");

});


cancelAddCompany.addEventListener("click", () => {

  addCompanyModal.classList.remove("show");

});

// ==========================================
// ADD COMPANY
// ==========================================

const addCompanyForm =
  document.getElementById("addCompanyForm");

const addCompanyMessage =
  document.getElementById("addCompanyMessage");

const saveCompanyButton =
  document.getElementById("saveCompanyButton");


addCompanyForm.addEventListener("submit", async (event) => {

  event.preventDefault();


  // Get form values

  const customer_name =
    document.getElementById("companyName").value.trim();

  const username =
    document.getElementById("companyUsername").value.trim();

  const password =
    document.getElementById("companyPassword").value;


  // Basic validation

  if (!customer_name || !username || !password) {

    addCompanyMessage.textContent =
      "Please fill all fields.";

    return;

  }


  // Disable button while saving

  saveCompanyButton.disabled = true;

  saveCompanyButton.textContent = "Adding...";

  addCompanyMessage.textContent = "";


  try {

    const response = await fetch(
      "http://localhost:3000/api/accounts",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          customer_name,
          username,
          password
        })
      }
    );


    const result = await response.json();


    // API error

    if (!response.ok) {

      throw new Error(
        result.message || "Failed to add company"
      );

    }


    // Success

    addCompanyMessage.textContent =
      "Company added successfully.";


    // Reset form

    addCompanyForm.reset();


    // Close modal after short delay

    setTimeout(() => {

      addCompanyModal.classList.remove("show");

      addCompanyMessage.textContent = "";

    }, 800);


    // Reload company list

    if (typeof loadCompanies === "function") {

      await loadCompanies();

    }


    // Reload dashboard summary

    if (typeof loadDashboard === "function") {

      await loadDashboard();

    }


  } catch (error) {

    console.error(
      "Add company error:",
      error
    );


    addCompanyMessage.textContent =
      error.message || "Failed to add company";


  } finally {

    saveCompanyButton.disabled = false;

    saveCompanyButton.textContent =
      "Add Company";

  }

});

// ==========================================
// EDIT COMPANY MODAL
// ==========================================

const editCompanyModal =
  document.getElementById("editCompanyModal");

const closeEditCompanyModal =
  document.getElementById("closeEditCompanyModal");

const cancelEditCompany =
  document.getElementById("cancelEditCompany");


// CLOSE EDIT MODAL

closeEditCompanyModal.addEventListener("click", () => {

  editCompanyModal.classList.remove("show");

});


cancelEditCompany.addEventListener("click", () => {

  editCompanyModal.classList.remove("show");

});