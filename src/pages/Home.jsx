import React, { useEffect, useState } from 'react';
import Main from '../components/section/Main';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';

Modal.setAppElement('#root'); // Modal 컴포넌트를 사용하기 위한 설정

const Home = () => {
    const [selectedDate, setSelectedDate] = useState(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
    const [allData, setAllData] = useState({});
    const [dates, setDates] = useState([]);
    const [previewData, setPreviewData] = useState(null);
    const [selectedSource, setSelectedSource] = useState('Bufftoon');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태 추가
    const [selectedTag, setSelectedTag] = useState(''); // 태그 상태 추가

    useEffect(() => {
        const fetchData = async (date) => {
            try {
                const naverWebtoonUrl = `https://raw.githubusercontent.com/skadbstj12/webtoon-rank/main/naverwebtoon/naverwebtoon_${date}.json`;
                const bufftoonUrl = `https://raw.githubusercontent.com/skadbstj12/webtoon-rank/main/bufftoon/bufftoon_${date}.json`;
                
                const naverWebtoonResponse = await fetch(naverWebtoonUrl);
                const bufftoonResponse = await fetch(bufftoonUrl);

                if (!naverWebtoonResponse.ok) {
                    console.error(`Error fetching naver webtoon data for ${date}:`, naverWebtoonResponse.statusText);
                    const naverWebtoonText = await naverWebtoonResponse.text();
                    console.error('Naver Webtoon response text:', naverWebtoonText);
                    return;
                }

                if (!bufftoonResponse.ok) {
                    console.error(`Error fetching bufftoon data for ${date}:`, bufftoonResponse.statusText);
                    const bufftoonText = await bufftoonResponse.text();
                    console.error('Bufftoon response text:', bufftoonText);
                    return;
                }

                const bufftoonData = await bufftoonResponse.json();
                const naverWebtoonData = await naverWebtoonResponse.json();

                setAllData((prevData) => ({
                    ...prevData,
                    [date]: {
                        Bufftoon: bufftoonData,
                        'Naver Webtoon': naverWebtoonData,
                    },
                }));
            } catch (error) {
                console.error(`Error fetching data for ${date}:`, error);
                setAllData((prevData) => ({
                    ...prevData,
                    [date]: {
                        Bufftoon: [],
                        'Naver Webtoon': [],
                    },
                }));
            }
        };

        const fetchDataForAllDates = async () => {
            try {
                const startDate = new Date('2024-05-16');
                const endDate = new Date(); // 오늘 날짜까지 데이터를 가져오도록 설정
                const dateList = [];

                while (startDate <= endDate) {
                    const currentDate = startDate.toISOString().split('T')[0];
                    dateList.push(currentDate);
                    startDate.setDate(startDate.getDate() + 1);
                }

                setDates(dateList);
                await Promise.all(dateList.map(fetchData));
            } catch (error) {
                console.error('Error fetching data for all dates:', error);
            }
        };

        fetchDataForAllDates();
    }, []);

    useEffect(() => {
        const fetchData = async (date) => {
            try {
                const bufftoonUrl = `https://raw.githubusercontent.com/skadbstj12/webtoon-rank/main/bufftoon/bufftoon_${date}.json`;
                const naverWebtoonUrl = `https://raw.githubusercontent.com/skadbstj12/webtoon-rank/main/naverwebtoon/naverwebtoon_${date}.json`;

                const bufftoonResponse = await fetch(bufftoonUrl);
                const naverWebtoonResponse = await fetch(naverWebtoonUrl);

                if (!naverWebtoonResponse.ok) {
                    console.error(`Error fetching naver webtoon data for ${date}:`, naverWebtoonResponse.statusText);
                    const naverWebtoonText = await naverWebtoonResponse.text();
                    console.error('Naver Webtoon response text:', naverWebtoonText);
                    return;
                }

                if (!bufftoonResponse.ok) {
                    console.error(`Error fetching bufftoon data for ${date}:`, bufftoonResponse.statusText);
                    const bufftoonText = await bufftoonResponse.text();
                    console.error('Bufftoon response text:', bufftoonText);
                    return;
                }

                const bufftoonData = await bufftoonResponse.json();
                const naverWebtoonData = await naverWebtoonResponse.json();

                setAllData((prevData) => ({
                    ...prevData,
                    [date]: {
                        'Naver Webtoon': naverWebtoonData,
                        Bufftoon: bufftoonData,
                    },
                }));
            } catch (error) {
                console.error(`Error fetching data for ${date}:`, error);
                setAllData((prevData) => ({
                    ...prevData,
                    [date]: {
                        'Naver Webtoon': [],
                        Bufftoon: [],
                    },
                }));
            }
        };

        fetchData(selectedDate);
    }, [selectedDate]);

    const handleDateChange = (date) => {
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const handleSourceChange = (event) => {
        setSelectedSource(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleTagChange = (event) => {
        setSelectedTag(event.target.value);
    };

    const handleImageClick = (webtoon) => {
        setPreviewData(webtoon);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPreviewData(null);
    };

    const renderWebtoonList = () => {
        const data = allData[selectedDate] ? allData[selectedDate][selectedSource] : [];
        
        const filteredData = data.filter(webtoon => 
            webtoon.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedTag === '' || (webtoon.tags && webtoon.tags.includes(selectedTag)))
        );

        return (
            <ul>
                {filteredData.length > 0 ? (
                    filteredData.map((webtoon, index) => (
                        <li key={index} className="webtoon-item">
                            <img
                                className="thumb"
                                src={webtoon.imageURL || webtoon.image_url}
                                alt={webtoon.title}
                                onClick={() => handleImageClick(webtoon)}
                            />
                            <h3 className="title">{webtoon.title}</h3>
                        </li>
                    ))
                ) : (
                    <p>No data available for the selected date or search query.</p>
                )}
            </ul>
        );
    };

    const renderModalContent = () => {
        if (!previewData) return null;

        if (selectedSource === 'Bufftoon') {
            return (
                <div className='modal-container'>
                    <img src={previewData.imageURL || previewData.image_url} alt="Preview" />
                    <div className="modal-title">
                        <h2>{previewData.title}</h2>
                        <div className="modal-header">
                            <span className='modal-cate'>카테고리: {previewData.tags}</span>
                            <span className='modal-artist'>작가: {previewData.authors}</span>
                        </div>
                        <span className='modal-text'>{previewData.description}</span>
                        <button className='webtoon-link'>
                            <Link to={previewData.url}>웹툰 보러가기</Link>
                        </button>
                    </div>
                </div>
            );
        } else if (selectedSource === 'Naver Webtoon') {
            return (
                <div className='modal-container'>
                    <img src={previewData.imageURL || previewData.image_url} alt="Preview" />
                    <div className="modal-title">
                        <h2>{previewData.title}</h2>
                        <div className="modal-header">
                            <span className='modal-cate'>카테고리: {previewData.tags}</span>
                            <span className='modal-artist'>작가: {previewData.authors}</span>
                        </div>
                        <span className='modal-text'>{previewData.description}</span>
                        <div>
                            {/* <span className='modal-weekday'>요일: {previewData.weekday}</span>
                            <span className='modal-age'>연령: {previewData.age}</span> */}
                        </div>
                        <button className='webtoon-link'>
                            <Link to={previewData.url}>웹툰 보러가기</Link>
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Main
            title="Webtoon Home"
            description="Explore various webtoons"
            previewImage={previewData ? previewData.imageURL || previewData.image_url : null}
            handleImageClick={handleImageClick}
        >
            <main id="main">
                <div className="content">
                    <section id="list">
                        <div className='searchbox'>
                            <label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search by title"
                                    className="search-input"
                                />
                            </label>
                        </div>
                        <div className='option_wrap'>
                            <label>
                                Date
                                <DatePicker
                                    selected={new Date(selectedDate)}
                                    onChange={handleDateChange}
                                    dateFormat="yyyy-MM-dd"
                                    className="date-picker"
                                />
                            </label>
                            <label>
                                Platform
                                <select value={selectedSource} onChange={handleSourceChange}>
                                    <option value="Naver Webtoon">Naver Webtoon</option>
                                    <option value="Bufftoon">Bufftoon</option>
                                </select>
                            </label>
                            <label className='tag_label'>
                                Tag
                                <select value={selectedTag} onChange={handleTagChange}>
                                    <option value="">선택 없음</option>
                                    <option value="액션">액션</option>
                                    <option value="학원">학원</option>
                                    <option value="로맨스">로맨스</option>
                                    <option value="판타지">판타지</option>
                                    <option value="개그">개그</option>
                                    <option value="스릴러">스릴러</option>
                                    <option value="사극">사극</option>
                                    <option value="드라마">드라마</option>
                                    <option value="감성">감성</option>
                                    <option value="스포츠">스포츠</option>
                                    <option value="먼치킨">먼치킨</option>
                                    <option value="아이돌">아이돌</option>
                                    <option value="회귀">회귀</option>
                                    <option value="성장물">성장물</option>
                                    <option value="범죄">범죄</option>
                                </select>
                            </label>
                        </div>
                        
                        <div>
                            {renderWebtoonList()}
                        </div>
                    </section>
                    <section id="details">
                        <a href="?list">
                            {previewData && <img id="hero" src={previewData.imageURL || previewData.image_url} alt="Preview" />}
                            <h4 className="title title-single">{previewData ? previewData.title : ''}</h4>
                        </a>
                    </section>
                </div>
            </main>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Image Modal"
                className="modal"
                overlayClassName="overlay"
            >
                <button onClick={closeModal}></button>
                {renderModalContent()}
            </Modal>
        </Main>
    );
};

export default Home;
