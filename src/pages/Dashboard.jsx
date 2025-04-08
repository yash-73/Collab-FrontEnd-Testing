import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../store/AuthSlice";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateRepoModal, setShowCreateRepoModal] = useState(false);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [pullRequests, setPullRequests] = useState([]);
  const [loadingPRs, setLoadingPRs] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const loadUser = useCallback( async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/auth/me", {
        withCredentials: true,
      });

      if (response.data.authenticated) {
        const userData = {
          isLoggedIn: true,
          data: {
            name: response.data.user.name,
            username: response.data.user.login,
            avatar: response.data.user.avatar_url,
            email: response.data.user.email,
            githubId: response.data.user.id,
          },
        };
        dispatch(login(userData));
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setError("Failed to load user data");
    }
  },[dispatch])

  const loadRepositories = useCallback( async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        "http://localhost:8080/api/github/repositories",
        {
          withCredentials: true,
        }
      );
      setRepositories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading repositories:", error);
      setError("Failed to load repositories");
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  },[ setRepositories, setLoading, setError, ])

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8080/api/auth/logout", {
        withCredentials: true,
      });
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleCreateRepository = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("repo-name"),
      description: formData.get("repo-description"),
      isPrivate: formData.get("repo-private") === "on",
    };

    try {
      await axios.post("/api/github/repositories", data, {
        withCredentials: true,
      });
      setShowCreateRepoModal(false);
      loadRepositories();
    } catch (error) {
      console.error("Error creating repository:", error);
    }
  };

  const handleCreateCommit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      branch: formData.get("commit-branch"),
      path: formData.get("commit-path"),
      message: formData.get("commit-message"),
      content: formData.get("commit-content"),
    };

    try {
      await axios.post(
        `/api/github/repositories/${selectedRepo}/commits`,
        data,
        { withCredentials: true }
      );
      setShowCommitModal(false);
    } catch (error) {
      console.error("Error creating commit:", error);
    }
  };

  const loadPullRequests = async (repoName) => {
    setLoadingPRs(true);
    try {
      const response = await axios.get(
        `/api/github/repositories/${repoName}/pulls`,
        { withCredentials: true }
      );
      setPullRequests(response.data);
    } catch (error) {
      console.error("Error loading pull requests:", error);
    }
    setLoadingPRs(false);
  };

  const handleMergePR = async (repoName, prNumber) => {
    if (
      !window.confirm(
        `Are you sure you want to merge pull request #${prNumber}?`
      )
    )
      return;

    try {
      await axios.post(
        `/api/github/repositories/${repoName}/pulls/${prNumber}/merge`,
        { message: `Merged pull request #${prNumber} through the application` },
        { withCredentials: true }
      );
      loadPullRequests(repoName);
    } catch (error) {
      console.error("Error merging pull request:", error);
    }
  };

  
  useEffect(() => {
    loadUser();
    loadRepositories();
  }, [loadUser, loadRepositories]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-bold">
            GitHub OAuth App
          </a>
          <div className="flex items-center space-x-4">
            {user?.data?.avatar && (
              <img
                src={user.data.avatar}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            {user?.data?.username && <span>{user.data.username}</span>}
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-white rounded hover:bg-white hover:text-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your GitHub Repositories</h2>
          <button
            onClick={() => setShowCreateRepoModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Create New Repository
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading repositories...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            {error}
            <button
              onClick={loadRepositories}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : repositories.length === 0 ? (
          <div className="text-center py-8">
            No repositories found. Create your first repository!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repositories.map((repo) => (
              <div key={repo.name} className="bg-white rounded-lg shadow p-4">
                <h3 className="text-xl font-semibold mb-2">{repo.name}</h3>
                <p className="text-gray-600 mb-2">
                  {repo.description || "No description"}
                </p>
                <div className="flex space-x-2 mb-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      repo.isPrivate
                        ? "bg-gray-200 text-gray-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {repo.isPrivate ? "Private" : "Public"}
                  </span>
                  <span className="text-sm text-gray-500">
                    Default branch: {repo.defaultBranch}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    View on GitHub
                  </a>
                  <button
                    onClick={() => {
                      setSelectedRepo(repo.name);
                      setShowCommitModal(true);
                    }}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    Commit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRepo(repo.name);
                      loadPullRequests(repo.name);
                      setShowPRModal(true);
                    }}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    Pull Requests
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Repository Modal */}
      {showCreateRepoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Repository</h3>
            <form onSubmit={handleCreateRepository}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Repository Name
                </label>
                <input
                  type="text"
                  name="repo-name"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  name="repo-description"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input type="checkbox" name="repo-private" className="mr-2" />
                  <span>Private Repository</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateRepoModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Commit Modal */}
      {showCommitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Create Commit</h3>
            <form onSubmit={handleCreateCommit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Branch</label>
                <input
                  type="text"
                  name="commit-branch"
                  defaultValue="main"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">File Path</label>
                <input
                  type="text"
                  name="commit-path"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Commit Message
                </label>
                <input
                  type="text"
                  name="commit-message"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">File Content</label>
                <textarea
                  name="commit-content"
                  rows="10"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCommitModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Commit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pull Requests Modal */}
      {showPRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Pull Requests</h3>
            {loadingPRs ? (
              <div className="text-center py-8">Loading pull requests...</div>
            ) : pullRequests.length === 0 ? (
              <div className="text-center py-8">
                No open pull requests found.
              </div>
            ) : (
              <div className="space-y-4">
                {pullRequests.map((pr) => (
                  <div key={pr.number} className="border rounded p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">
                        #{pr.number}: {pr.title}
                      </span>
                      <span className="text-gray-600">by {pr.author}</span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {pr.body || "No description"}
                    </p>
                    <div className="flex space-x-2">
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 border rounded hover:bg-gray-100"
                      >
                        View on GitHub
                      </a>
                      <button
                        onClick={() => handleMergePR(selectedRepo, pr.number)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Merge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPRModal(false)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
