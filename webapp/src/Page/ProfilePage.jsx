import { useState, useEffect } from 'react';
import { getCourse } from '../Utils/courseUtil';
import Header from '../Components/header';
import Button from '../Components/ui/button';
import useAuth from "../ContextAPI/UseAuth";
import { fetchUserData, updateUserData } from "../Utils/userUtil.js";

export default function ProfilePage() {
	const facultyOptions = [
		'KHOA ĐIỆN - ĐIỆN TỬ',
		'KHOA KỸ THUẬT XÂY DỰNG',
		'KHOA CƠ KHÍ',
		'KHOA KỸ THUẬT HOÁ HỌC',
		'KHOA KHOA HỌC VÀ KỸ THUẬT MÁY ΤÍΝΗ',
		'KHOA CÔNG NGHỆ VẬT LIỆU',
		'KHOA KHOA HỌC ỨNG DỤNG',
		'KHOA KỸ THUẬT GIAO THÔNG',
		'KHOA QUẢN LÝ CÔNG NGHIỆP',
		'KHOA KỸ THUẬT ĐỊA CHẤT VÀ DẦU KHÍ',
		'KHOA MÔI TRƯỜNG VÀ TÀI NGUYÊN',
	];
	
	const { user } = useAuth();

	const [profile, setProfile] = useState({
		userId: user.id,
		mssv: '', // Cho phép nhập lần đầu
		fullname: "-", // async => update later.
		email: user.email,
		phone: user.phone,
		faculty: 'KHOA KHOA HỌC VÀ KỸ THUẬT MÁY ΤÍΝΗ',
		major: user.major || '',
		description: '',
		type: user.type,
	});

	const [courseOptions, setCourseOptions] = useState([]);


	const [editMode, setEditMode] = useState(false);
	const [editData, setEditData] = useState({});
	const [mssvEditable, setMssvEditable] = useState(true);
	
	useEffect(() => {
		const fetchProfile = async () => {
			const user_data = await fetchUserData(user.email);
			if (user_data) {
				const data = {
					fullname: user_data.name || "-",
					phone: user_data.phone || "",
					description: user_data.introduce || "",
					mssv: user_data.mssv || "",
					major: user_data.major || "",
				};
				setProfile((prev) => ({ ...prev, ...data }));
				setEditData((prev) => ({ ...prev, ...data }));
			}
		};
		fetchProfile();
		// Lấy danh sách môn học
		getCourse().then(res => {
			if (res && res.getCourse) setCourseOptions(res.getCourse);
		});
	}, [user.email]);

	const handleEditClick = () => {
		if (profile) {
			setEditData({ ...profile });
			setEditMode(true);
			// Nếu đã có MSSV thì không cho sửa nữa
			setMssvEditable(profile.mssv === '' || profile.mssv === undefined);
		}
	};

	const handleEditChange = (e) => {
		const { name, value, options, type } = e.target;
		if (name === 'major' && type === 'select-multiple') {
			// Lấy các option được chọn
			const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
			setEditData((prev) => ({ ...prev, [name]: selected.join(';') }));
		} else {
			setEditData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleEditCancel = () => {
		setEditMode(false);
	};

	const handleEditSave = async (e) => {
		e.preventDefault();
		// Validate MSSV (7 digits)
		if ((profile.type?.toLowerCase() === 'student') && mssvEditable) {
			if (!/^\d{7}$/.test(editData.mssv || '')) {
				alert('MSSV phải gồm đúng 7 chữ số.');
				return;
			}
		}
		// Validate phone (10 digits)
		if (editData.phone && !/^\d{10}$/.test(editData.phone)) {
			alert('Số điện thoại phải gồm đúng 10 chữ số.');
			return;
		}
		// Validate courses (1-3 course codes, each 6 chars, separated by ;) 
		if ((profile.type?.toLowerCase() === 'tutor')) {
			if (editData.major) {
				const codes = editData.major.split(';').map(s => s.trim()).filter(Boolean);
				if (codes.length < 1 || codes.length > 3) {
					alert('Bạn phải chọn từ 1 đến 3 môn học.');
					return;
				}
				// Kiểm tra mã có trong danh sách courseOptions không
				if (codes.some(code => !courseOptions.find(c => c.id === code))) {
					alert('Có mã môn học không hợp lệ.');
					return;
				}
			} else {
				alert('Vui lòng chọn ít nhất 1 môn học.');
				return;
			}
		}
		// Validate description (max 1000 chars)
		if (editData.description && editData.description.length > 1000) {
			alert('Mô tả năng lực không được vượt quá 1000 ký tự.');
			return;
		}

		const studentMssv =
			profile.type?.toLowerCase() === 'student'
				? (mssvEditable ? editData.mssv : profile.mssv)
				: null;

		const tutorMajor =
			profile.type?.toLowerCase() === 'tutor'
				? editData.major
				: null;

		const updatedUser = await updateUserData({
			id: user.id,
			email: profile.email, // Email không cho sửa
			full_name: editData.fullname,
			phone: editData.phone,
			introduce: editData.description,
			mssv: studentMssv,
			major: tutorMajor,
		});

		if (updatedUser) {
			setProfile((prev) => ({
				...prev,
				fullname: updatedUser.name,
				phone: updatedUser.phone,
				email: updatedUser.email,
				mssv: updatedUser.mssv ?? prev.mssv,
				type: updatedUser.type,
				description: updatedUser.introduce || '',
				major: updatedUser.major ?? prev.major,
			}));
			setEditMode(false);
			if (studentMssv) {
				setMssvEditable(false); // Sau khi lưu thì MSSV không cho sửa nữa
			}
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<main className="flex flex-col items-center justify-center py-12 px-4">
				<div className="w-full max-w-5xl bg-white rounded-2xl border border-gray-200 shadow p-0 flex flex-row items-stretch">
					{/* Left: Avatar & Name */}
					<div className="flex flex-col items-center justify-center w-1/3 py-10 px-6">
						<img
							src="/profile_icon.svg"
							alt="Avatar"
							className="w-24 h-24 rounded-full border-4 border-gray-200 bg-gray-100 object-cover mb-4"
						/>
						<h2 className="text-xl font-bold mb-1 text-center">{profile.fullname}</h2>
						<p className="text-gray-500 text-center">{profile.type}</p>
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
									{(profile.type === 'student' || profile.type === 'Student') && (
										<div className="flex justify-between items-center">
											<span className="text-gray-500 font-medium">MSSV</span>
											<span className="font-semibold text-gray-900">{profile.mssv || <span className='italic text-gray-400'>Chưa cập nhật</span>}</span>
										</div>
									)}
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
									{(profile.type === 'tutor' || profile.type === 'Tutor') && (
										<div className="flex justify-between items-center">
											<span className="text-gray-500 font-medium">Khóa học</span>
											<span className="font-semibold text-gray-900 flex flex-col items-end">
												{profile.major
													? profile.major.split(';').map((s, idx) => (
														<span key={idx} className="block text-right">{s.trim()}</span>
													))
													: <span className='italic text-gray-400'>Chưa cập nhật</span>
												}
											</span>
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
									<span className="text-gray-500 font-medium">UserID</span>
									<input
										type="text"
										name="userId"
										value={profile.userId}
										disabled
										className="border border-gray-300 rounded px-2 py-1 w-2/3 text-gray-400 bg-gray-100 cursor-not-allowed"
									/>
								</div>
								{
									(profile.type === 'student' || profile.type === 'Student') && (      
									<div className="flex justify-between items-center">
										<span className="text-gray-500 font-medium">MSSV</span>
										<input
											type="text"
											name="mssv"
											value={mssvEditable ? editData.mssv || '' : profile.mssv}
											onChange={handleEditChange}
											className={`border border-gray-300 rounded px-2 py-1 w-2/3 ${!mssvEditable ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-900'}`}
											required
											disabled={!mssvEditable}
											placeholder="Nhập MSSV lần đầu"
											inputMode="numeric"
											pattern="\d{7}"
											maxLength={7}
											minLength={7}
										/>
									</div>
									)
								}   
								<div className="flex justify-between items-center">
									<span className="text-gray-500 font-medium">Email</span>
									<input
										type="email"
										name="email"
										value={profile.email}
										disabled
										className="border border-gray-300 rounded px-2 py-1 w-2/3 text-gray-400 bg-gray-100 cursor-not-allowed"
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
										inputMode="numeric"
										pattern="\d{10}"
										maxLength={10}
										minLength={10}
									/>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-500 font-medium">Khoa</span>
									<select
										name="faculty"
										value={editData.faculty}
										onChange={handleEditChange}
										className="border border-gray-300 rounded px-2 py-1 w-2/3 text-gray-900"
										required
									>
										<option value="" disabled>Chọn khoa</option>
										{facultyOptions.map((faculty) => (
											<option key={faculty} value={faculty}>{faculty}</option>
										))}
									</select>
								</div>
								{ (profile.type === 'tutor' || profile.type === 'Tutor') && (
									<div className="flex flex-col gap-1">
										<div className="flex justify-between items-center">
											<span className="text-gray-500 font-medium">Khóa học</span>
											<select
												name="major-select"
												value=""
												onChange={e => {
													const val = e.target.value;
													if (!val) return;
													const selected = editData.major ? editData.major.split(';').map(s => s.trim()).filter(Boolean) : [];
													if (!selected.includes(val) && selected.length < 3) {
														setEditData(prev => ({ ...prev, major: [...selected, val].join(';') }));
													}
												}}
												className="border border-gray-300 rounded px-2 py-1 w-2/3 text-gray-900"
												required={!(editData.major && editData.major.split(';').filter(Boolean).length > 0)}
											>
												<option value="" disabled>Chọn môn...</option>
												{courseOptions.filter(c => !(editData.major || '').split(';').includes(c.id)).map((course) => (
													<option key={course.id} value={course.id}>
														{course.id} - {course.name}
													</option>
												))}
											</select>
										</div>
										<div className="flex justify-end mt-1 w-full">
											<span className="text-xs text-gray-400">(Chọn tối đa 3)</span>
										</div>
										<div className="flex flex-col gap-2 mt-2 items-end w-full">
											{(editData.major ? editData.major.split(';').filter(Boolean) : []).map(code => {
												const course = courseOptions.find(c => c.id === code);
												return (
													<span key={code} className="inline-flex items-center bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-xs font-medium w-fit">
														{course ? `${course.id} - ${course.name}` : code}
														<button type="button" className="ml-2 text-gray-500 hover:text-red-600" onClick={() => {
															const selected = editData.major.split(';').map(s => s.trim()).filter(Boolean).filter(c => c !== code);
															setEditData(prev => ({ ...prev, major: selected.join(';') }));
														}}>&times;</button>
													</span>
												);
											})}
										</div>
									</div>
								)}
								<div className="flex flex-col gap-1">
									<span className="text-gray-500 font-medium">Mô tả năng lực</span>
									<textarea
										name="description"
										value={editData.description}
										onChange={handleEditChange}
										className="border border-gray-300 rounded px-2 py-1 w-full text-gray-900 min-h-[60px]"
										maxLength={2000}
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
