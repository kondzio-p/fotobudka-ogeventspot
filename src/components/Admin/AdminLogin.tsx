import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface AdminLoginProps {
	onLogin: (isAuthenticated: boolean) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
	const [credentials, setCredentials] = useState({ login: "", password: "" });
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const { data, error } = await supabase.auth.signInWithPassword({
			email: credentials.login, // użyj pola "login" jako e-mail
			password: credentials.password,
		});

		if (error) {
			setError("Nieprawidłowy login lub hasło");
		} else {
			onLogin(true);
			navigate("/admin/panel");
		}
		setIsLoading(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCredentials((prev) => ({ ...prev, [name]: value }));
		if (error) setError("");
	};

	return (
		<div className="admin-login-container">
			<div className="admin-login-box">
				<div className="admin-logo-section">
					<div className="admin-logo">
						<img
							src="/assets/main/images/og-events-logo-black.webp"
							alt="OG Events Logo"
							width="150"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.outerHTML =
									'<div style="color: #8b4b7a; font-weight: bold; font-size: 32px; margin-bottom: 20px;">OG<br><span style="font-size: 16px; font-weight: normal;">EVENT SPOT</span></div>';
							}}
						/>
					</div>
				</div>

				<form className="admin-login-form" onSubmit={handleSubmit}>
					{error && (
						<div className="alert alert-danger" role="alert">
							{error}
						</div>
					)}

					<div className="form-group">
						<label htmlFor="login">Login:</label>
						<input
							type="text"
							id="login"
							name="login"
							className="form-control"
							value={credentials.login}
							onChange={handleInputChange}
							required
							disabled={isLoading}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Hasło:</label>
						<input
							type="password"
							id="password"
							name="password"
							className="form-control"
							value={credentials.password}
							onChange={handleInputChange}
							required
							disabled={isLoading}
						/>
					</div>

					<button
						type="submit"
						className="btn btn-admin-login"
						disabled={isLoading}
					>
						{isLoading ? "Logowanie..." : "Zaloguj się"}
					</button>
				</form>

				<div className="admin-login-info">
					<small className="text-muted">
						Panel administracyjny OG Event Spot
					</small>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
