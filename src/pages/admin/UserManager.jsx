import { useEffect, useState } from "react";
import { getUsers, deleteUser, updateUser } from "../../services/userService";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await getUsers();
    setUsers(res.data);
  };

  const handleDelete = async (user) => {
    if (user.role === "admin") {
      alert("Cannot delete admin!");
      return;
    }

    if (window.confirm("Delete this user?")) {
      await deleteUser(user.id);
      loadUsers();
    }
  };

  const handleUpdateRole = async () => {
    await updateUser(editingUser.id, editingUser);
    setEditingUser(null);
    loadUsers();
  };

  // SEARCH (START WITH)
  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().startsWith(search.toLowerCase()) ||
      u.email.toLowerCase().startsWith(search.toLowerCase())
  );

  // PAGINATION
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div>
      <h2 className="mb-3">User Manager</h2>

      {/* SEARCH */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search user..."
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Email</th>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Role</th>
            <th width="160">Action</th>
          </tr>
        </thead>

        <tbody>
          {currentUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.fullName}</td>
              <td>{u.phone}</td>

              <td>
                <span
                  className={`badge ${
                    u.role === "admin" ? "bg-danger" : "bg-primary"
                  }`}
                >
                  {u.role}
                </span>
              </td>

              <td className="d-flex gap-2">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => setEditingUser(u)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(u)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {currentUsers.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <span>
          Page {currentPage} / {totalPages || 1}
        </span>

        <div className="btn-group">
          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>

          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* EDIT ROLE */}
      {editingUser && (
        <div className="card p-3 mt-4">
          <h5>Edit Role - {editingUser.fullName}</h5>

          <select
            className="form-select mb-3"
            value={editingUser.role}
            onChange={(e) =>
              setEditingUser({ ...editingUser, role: e.target.value })
            }
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={handleUpdateRole}>
              Save
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;