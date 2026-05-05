<script lang="ts">
	import GithubIcon from '~icons/mdi/github';
</script>

<main>
	<div class="card">
		<div class="logo">MK</div>
		<h1>Yönetim Paneli</h1>
		<p>Sadece yetkili GitHub hesabı erişebilir.</p>

		<a class="btn" href="/api/auth/github">
			<GithubIcon /> GitHub ile Giriş Yap
		</a>

		<a class="back" href="/">← Siteye dön</a>
	</div>
</main>

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1rem;
	}

	.card {
		background: white;
		padding: 3rem 2.5rem;
		border-radius: 1rem;
		box-shadow: 0 20px 60px hsla(0, 0%, 0%, 0.2);
		text-align: center;
		max-width: 380px;
		width: 100%;
	}

	.logo {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.4rem;
		font-weight: 600;
		margin: 0 auto 1.5rem;
	}

	h1 {
		font-size: 1.5rem;
		margin: 0 0 0.4rem;
	}

	p {
		color: #6e6e73;
		font-size: 0.9rem;
		margin: 0 0 2rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: #1d1d1f;
		color: white;
		text-decoration: none;
		padding: 0.8rem 1.4rem;
		border-radius: 0.5rem;
		font-weight: 500;
		transition: background 0.15s;
	}

	.btn:hover {
		background: #000;
	}

	.back {
		display: block;
		margin-top: 1.5rem;
		color: #6e6e73;
		text-decoration: none;
		font-size: 0.85rem;
	}

	.back:hover {
		color: #1d1d1f;
	}
</style>
