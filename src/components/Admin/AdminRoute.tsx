import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface AdminRouteProps {
	children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
		null
	);

	useEffect(() => {
		let unsub: () => void;

		const init = async () => {
			// 1) sprawdź bieżącą sesję
			const { data } = await supabase.auth.getSession();
			setIsAuthenticated(!!data.session);

			// 2) nasłuchuj zmian (login/logout/wygaśnięcie)
			const {
				data: { subscription },
			} = supabase.auth.onAuthStateChange((_event, session) => {
				setIsAuthenticated(!!session);
			});

			unsub = () => subscription.unsubscribe();
		};

		init();
		return () => unsub && unsub();
	}, []);

	if (isAuthenticated === null) {
		return (
			<div className="admin-loading">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Ładowanie...</span>
				</div>
			</div>
		);
	}

	return isAuthenticated ? (
		<>{children}</>
	) : (
		<Navigate to="/admin/login" replace />
	);
};

export default AdminRoute;
