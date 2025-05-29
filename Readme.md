```html
<h1>GameShow (Sankalp - New UI Branch)</h1>

<p>Welcome to the <strong>SBNA Game Show</strong> project!<br>
This branch focuses on the updated UI design.</p>

<h3>⚙️ Setup Instructions</h3>

<p>Before running the project, make sure you <strong>update the following configuration files</strong>:</p>

<hr>

<h3>1️⃣ Database Name</h3>

<ul>
  <li>Go to:
    <pre>/backend/src/config/constants.js</pre>
  </li>
  <li>Update the database name to match your local or remote MongoDB instance.</li>
</ul>

<p>Example:</p>
<pre><code>export const DATABASE_NAME = "YourDatabaseNameHere";
</code></pre>

<hr>

<h3>2️⃣ API Key</h3>

<ul>
  <li>Go to:
    <pre>/frontend/src/constants/constants.ts</pre>
  </li>
  <li>Update the <code>API_KEY</code> value with the correct key you will use for API requests.</li>
</ul>

<p>Example:</p>
<pre><code>export const API_KEY = "your-unique-api-key";
</code></pre>

<hr>

<h3>📁 Folder Reference</h3>

<table border="1" cellpadding="5" cellspacing="0">
  <tr>
    <th>Folder</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td>/backend</td>
    <td>Express backend, MongoDB models</td>
  </tr>
  <tr>
    <td>/frontend</td>
    <td>React frontend (New UI branch)</td>
  </tr>
  <tr>
    <td>/frontend/src/constants</td>
    <td>Holds <code>constants.ts</code> for API keys and settings</td>
  </tr>
  <tr>
    <td>/backend/src/config</td>
    <td>Holds <code>constants.js</code> for DB configs and backend settings</td>
  </tr>
</table>

<hr>

<h3>✅ Reminders</h3>

<ul>
  <li>Always <strong>check these files</strong> before pushing or running locally.</li>
  <li>Keep your <strong>API keys private</strong> and don’t commit sensitive keys into the repository.</li>
  <li>Update <code>.env</code> files if needed, depending on your deployment setup.</li>
</ul>

<hr>
