import { useState } from 'react';
import Header from '../Components/header';
import Button from '../Components/ui/button';

export default function ProfilePage() {
	const [profile, setProfile] = useState({
		userId: 1,
		mssv: '2352888',
		fullname: 'Phat_Stu',
		email: 'phatstu@gmail.com',
		phone: '0912345678',
		faculty: 'Khoa học máy tính',
		major: 'Công nghệ phần mềm',
		description: 'Sinh viên năng động, có kỹ năng lập trình web, teamwork tốt.',
		role: 'Student',
	});

	const [editMode, setEditMode] = useState(false);
	const [editData, setEditData] = useState({
		email: profile.email,
		phone: profile.phone,
		faculty: profile.faculty,
		major: profile.major,
		description: profile.description,
	});

	const handleEditClick = () => {
		setEditData({
			email: profile.email,
			phone: profile.phone,
			faculty: profile.faculty,
			major: profile.major,
			description: profile.description,
		});
		setEditMode(true);
	};

	const handleEditChange = (e) => {
		const { name, value } = e.target;
		setEditData((prev) => ({ ...prev, [name]: value }));
	};

	const handleEditCancel = () => {
		setEditMode(false);
	};

	const handleEditSave = (e) => {
		e.preventDefault();
		setProfile((prev) => ({
			...prev,
			email: editData.email,
			phone: editData.phone,
			faculty: editData.faculty,
			major: prev.role === 'Tutor' ? editData.major : prev.major,
			description: editData.description,
		}));
		setEditMode(false);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<main className="flex flex-col items-center justify-center py-12 px-4">
				   <div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-200 shadow p-0 flex flex-row items-stretch">
					   {/* Left: Avatar & Name */}
					   <div className="flex flex-col items-center justify-center w-1/3 py-10 px-6">
						   <img
							   src="/profile_icon.svg"
							   alt="Avatar"
							   className="w-24 h-24 rounded-full border-4 border-gray-200 bg-gray-100 object-cover mb-4"
						   />
						   <h2 className="text-xl font-bold mb-1 text-center">{profile.fullname}</h2>
						   <p className="text-gray-500 text-center">{profile.role}</p>
					   </div>
					   {/* Divider */}
					   <div className="w-px bg-gray-300 my-8" />
					   {/* Right: Info & Edit */}
					<div className="flex-1 flex flex-col justify-center px-8 py-10">
						<h3 className="text-2xl font-bold mb-2">Hồ sơ cá nhân</h3>
						<p className="text-gray-500 mb-6">Thông tin tài khoản Mentor-Link</p>
						{!editMode ? (
							<>
								<div className="w-full space-y-4 mb-6">
									<div className="flex justify-between items-center">
										<span className="text-gray-500 font-medium">UserID</span>
										<span className="font-semibold text-gray-900">{profile.userId}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-500 font-medium">MSSV</span>
										<span className="font-semibold text-gray-900">{profile.mssv}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-500 font-medium">Email</span>
										<span className="font-semibold text-gray-900">{profile.email}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-500 font-medium">SĐT</span>
										<span className="font-semibold text-gray-900">{profile.phone || <span className='italic text-gray-400'>Chưa cập nhật</span>}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-500 font-medium">Khoa</span>
										<span className="font-semibold text-gray-900">{profile.faculty}</span>
									</div>
									{profile.role === 'Tutor' && (
										<div className="flex justify-between items-center">
											<span className="text-gray-500 font-medium">Chuyên môn</span>
											<span className="font-semibold text-gray-900">{profile.major}</span>
										</div>
									)}
									<div className="flex flex-col gap-1">
										<span className="text-gray-500 font-medium">Mô tả năng lực</span>
										<span className="font-semibold text-gray-900 whitespace-pre-line">{profile.description}</span>
									</div>
								</div>
								<Button
									variant="default"
									size="lg"
									className="w-full bg-black text-white hover:bg-gray-800 transition font-semibold text-base py-3"
									onClick={handleEditClick}
								>
									Chỉnh sửa hồ sơ
								</Button>
							</>
						) : (
							<form className="w-full space-y-4 mb-6" onSubmit={handleEditSave}>
								<div className="flex justify-between items-center">
									<span className="text-gray-500 font-medium">Email</span>
									<input
										type="email"
										name="email"
										value={editData.email}
										onChange={handleEditChange}
										className="border border-gray-300 rounded px-2 py-1 w-2/3 text-gray-900"
										required
									/>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-500 font-medium">SĐT</span>
									<input
										type="text"
										name="phone"
										value={editData.phone}
										onChange={handleEditChange}
										className="border border-gray-300 rounded px-2 py-1 w-2/3 text-gray-900"
									/>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-500 font-medium">Khoa</span>
									<input
										type="text"
										name="faculty"
										value={editData.faculty}
										onChange={handleEditChange}
										className="border border-gray-300 rounded px-2 py-1 w-2/3 text-gray-900"
									/>
								</div>
								{profile.role === 'Tutor' && (
									<div className="flex justify-between items-center">
										<span className="text-gray-500 font-medium">Chuyên môn</span>
										<input
											type="text"
											name="major"
											value={editData.major}
											onChange={handleEditChange}
											className="border border-gray-300 rounded px-2 py-1 w-2/3 text-gray-900"
										/>
									</div>
								)}
								<div className="flex flex-col gap-1">
									<span className="text-gray-500 font-medium">Mô tả năng lực</span>
									<textarea
										name="description"
										value={editData.description}
										onChange={handleEditChange}
										className="border border-gray-300 rounded px-2 py-1 w-full text-gray-900 min-h-[60px]"
									/>
								</div>
								<div className="flex gap-3 pt-2">
									<Button
										type="submit"
										variant="default"
										size="lg"
										className="flex-1 bg-black text-white hover:bg-gray-800 transition font-semibold text-base py-3"
									>
										Lưu
									</Button>
									<Button
										type="button"
										variant="outline"
										size="lg"
										className="flex-1 border-gray-300 text-gray-700 bg-white hover:bg-gray-100 font-semibold text-base py-3"
										onClick={handleEditCancel}
									>
										Hủy
									</Button>
								</div>
							</form>
						)}
					</div>
				   </div>
			</main>
		</div>
	);
}