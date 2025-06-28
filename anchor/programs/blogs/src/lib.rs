#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("229muqFhfrLZVP8q5CrSe7x1LyHLj54wopYdpX9Mzbuw");

pub const ANCHOR_DISCRIMINATOR_LENGTH: usize = 8;

#[program]
pub mod blogs {
    use super::*;

    pub fn initialize_blog(
        ctx: Context<InitializeBlog>,
        _blog_id: String,
        title: String,
        ipfs_hash: String,
        sha256_hash: String,
    ) -> Result<()> {
        let blog_state: &mut Account<'_, BlogState> = &mut ctx.accounts.blog_state;
        blog_state.owner = ctx.accounts.owner.key();
        blog_state.title = title;
        blog_state.ipfs_hash = ipfs_hash;
        blog_state.sha256_hash = sha256_hash;
        Ok(())
    }

    pub fn update_blog(
        ctx: Context<UpdateBlog>,
        _blog_id: String, // Passed only for seed derivation
        title: String,
        ipfs_hash: String,
        sha256_hash: String,
    ) -> Result<()> {
        let blog_state = &mut ctx.accounts.blog_state;
    
        blog_state.title = title;
        blog_state.ipfs_hash = ipfs_hash;
        blog_state.sha256_hash = sha256_hash;
    
        Ok(())
    }

    pub fn delete_blog(ctx: Context<DeleteBlog>, _blog_id: String) -> Result<()> {
        let blog_state = &mut ctx.accounts.blog_state;
        blog_state.title = String::new();
        blog_state.ipfs_hash = String::new();
        blog_state.sha256_hash = String::new();
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct BlogState {
    pub owner: Pubkey,
    #[max_len(32)]
    pub title: String,
    #[max_len(64)]
    pub ipfs_hash: String,
    #[max_len(64)]
    pub sha256_hash: String,
}

#[derive(Accounts)]
#[instruction(blog_id: String)]
pub struct InitializeBlog<'info> {
    #[account(
        init,
        payer = owner,
        space = BlogState::INIT_SPACE + ANCHOR_DISCRIMINATOR_LENGTH,
        seeds = [blog_id.as_bytes(), owner.key().as_ref()],
        bump
    )]
    pub blog_state: Account<'info, BlogState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(blog_id: String)]
pub struct UpdateBlog<'info> {
    #[account(
        mut,
        seeds = [blog_id.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = BlogState::INIT_SPACE + ANCHOR_DISCRIMINATOR_LENGTH,
        realloc::payer = owner, 
        realloc::zero = true, 
    )]
    pub blog_state: Account<'info, BlogState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(blog_id: String)]
pub struct DeleteBlog<'info> {
    #[account(
        mut,
        seeds = [blog_id.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = BlogState::INIT_SPACE + ANCHOR_DISCRIMINATOR_LENGTH,
        realloc::payer = owner,
        realloc::zero = true,
        close = owner,
    )]
    pub blog_state: Account<'info, BlogState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}